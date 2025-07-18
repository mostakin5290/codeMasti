// components/pages/DailyChallengeAdmin.jsx

import React, { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, message, Modal, Select } from 'antd';
import {
    FireOutlined,
    TrophyOutlined,
    CalendarOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import axiosClient from '../../../api/axiosClient';
import moment from 'moment'; // Ensure moment is imported

import { useTheme } from '../../../context/ThemeContext'; // Adjust path if needed

const { Option } = Select;

// Define the default theme (should ideally be imported from a central config)
const defaultTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonPrimary: 'bg-indigo-600',
    buttonPrimaryHover: 'bg-indigo-700',
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400',
    warningColor: 'text-amber-400',
    errorColor: 'text-red-400',
    infoColor: 'text-blue-400',
};

const DailyChallengeAdmin = () => {
    const { theme: themeFromContext } = useTheme();
    const theme = { ...defaultTheme, ...themeFromContext };

    const [challenges, setChallenges] = useState([]);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProblemId, setSelectedProblemId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(moment()); // Initialize with today's date
    const [isEditing, setIsEditing] = useState(false);
    const [editingChallengeId, setEditingChallengeId] = useState(null);

    const columns = [
        {
            title: 'Date',
            dataIndex: 'dailyChallengeDate',
            key: 'date',
            render: (date) => (
                <div className="flex items-center">
                    <CalendarOutlined className={`mr-2 ${theme.infoColor}`} /> {/* Applied theme */}
                    {moment(date).format('MMMM Do, YYYY')}
                </div>
            ),
            sorter: (a, b) => moment(a.dailyChallengeDate).valueOf() - moment(b.dailyChallengeDate).valueOf(),
            defaultSortOrder: 'ascend',
        },
        {
            title: 'Problem Details',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div>
                        <Tag color={record.difficulty === 'easy' ? 'green' :
                            record.difficulty === 'medium' ? 'gold' : 'red'}>
                            {record.difficulty.toUpperCase()}
                        </Tag>
                    </div>
                </div>
            ),
        },

        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="flex space-x-2">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        className="flex items-center justify-center"
                        type="primary" // Ant Design primary button
                        ghost
                    >
                        Edit
                    </Button>
                </div>
            ),
        },
    ];

    useEffect(() => {
        fetchDailyChallenges();
        fetchProblems();
    }, []);

    const fetchDailyChallenges = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/problem/daily/previous?sort=desc');
            setChallenges(res.data);
        } catch (err) {
            message.error('Failed to fetch daily challenges. Please try again.');
            console.error("Error fetching daily challenges:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProblems = async () => {
        try {
            const res = await axiosClient.get('/problem/getAllProblem');
            setProblems(res.data);
        } catch (err) {
            message.error('Failed to fetch problems list. Please try again.');
            console.error("Error fetching problems:", err);
        }
    };

    const handleCreate = () => {
        setIsEditing(false);
        setSelectedProblemId(null);
        setSelectedDate(moment()); // Reset date to today for new challenge
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        if (!selectedProblemId) {
            message.warning('Please select a problem for the daily challenge.');
            return;
        }
        if (!selectedDate || selectedDate.isBefore(moment().startOf('day'))) {
            message.warning('Please select today\'s date or a future date.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                problemId: selectedProblemId,
                date: selectedDate.toISOString()
            };

            await axiosClient.post('/problem/daily/set', payload);
            message.success(`Daily challenge set successfully for ${selectedDate.format('YYYY-MM-DD')}!`);

            setModalVisible(false);
            fetchDailyChallenges(); // Refresh the list
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to set daily challenge. Please check console for details.';
            message.error(errorMessage);
            console.error("Error setting daily challenge:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (challengeId) => {
        Modal.confirm({
            title: 'Remove Daily Challenge',
            content: 'Are you sure you want to remove this scheduled daily challenge? This action cannot be undone.',
            okText: 'Remove',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                setLoading(true);
                try {
                    await axiosClient.delete(`/problem/daily/${challengeId}`);
                    message.success('Daily challenge removed successfully!');
                    fetchDailyChallenges();
                } catch (err) {
                    message.error('Failed to remove daily challenge. Please try again.');
                    console.error("Error deleting daily challenge:", err);
                } finally {
                    setLoading(false);
                }
            },
            onCancel() {
                console.log('Cancel removing daily challenge');
            },
        });
    };

    const handleEdit = (challenge) => {
        setIsEditing(true);
        setEditingChallengeId(challenge._id);
        setSelectedProblemId(challenge.problemId); // Use problemId for selection
        setSelectedDate(moment(challenge.dailyChallengeDate)); // Set the date for editing
        setModalVisible(true);
    };

    const filterProblemOption = (input, option) =>
        option.children.toLowerCase().includes(input.toLowerCase());

    return (
        <div className={`daily-challenge-admin p-6 ${theme.background} ${theme.text}`}>
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-3xl font-bold flex items-center ${theme.text}`}> {/* Applied theme */}
                    <FireOutlined className={`mr-2 ${theme.highlight}`} /> {/* Applied theme */}
                    Daily Challenges Management
                </h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                    className={`flex items-center justify-center ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText}`} // Applied theme
                    size="large"
                >
                    Set New Challenge
                </Button>
            </div>

            {/* Table displaying current and past challenges */}
            <Card
                title={
                    <div className="flex items-center">
                        <CalendarOutlined className={`mr-2 text-lg ${theme.infoColor}`} />
                        <span className={`text-xl font-semibold ${theme.highlightTertiary}`}>
                            Scheduled Daily Challenges
                        </span>
                    </div>
                }
                bordered={false}
                className={`shadow-lg rounded-xl ${theme.cardBg} ${theme.border}`}
            >
                <Table
                    columns={columns}
                    dataSource={challenges}
                    loading={loading}
                    rowKey="_id"
                    pagination={{ pageSize: 10, className: 'mt-4' }}
                    className="ant-table-custom"
                    size="large"
                />
            </Card>

            {/* Modal for setting/editing a daily challenge */}
            <Modal
                title={isEditing ? (
                    <div className="flex items-center">
                        <EditOutlined className={`mr-2 text-lg ${theme.infoColor}`} /> {/* Applied theme */}
                        <span className="text-xl font-semibold">Edit Daily Challenge</span>
                    </div>
                ) : (
                    <div className="flex items-center">
                        <PlusOutlined className={`mr-2 text-lg ${theme.successColor}`} /> {/* Applied theme */}
                        <span className="text-xl font-semibold">Set New Daily Challenge</span>
                    </div>
                )}
                visible={modalVisible}
                onOk={handleSubmit}
                onCancel={() => {
                    setModalVisible(false);
                    setIsEditing(false);
                    setEditingChallengeId(null);
                    setSelectedProblemId(null);
                    setSelectedDate(moment()); // Reset to today for new, or keep previous for edit
                }}
                confirmLoading={loading}
                width={600}
                okText={isEditing ? "Update Challenge" : "Set Challenge"}
                okButtonProps={{
                    className: `flex items-center justify-center ${loading ? '' : theme.buttonPrimary} ${loading ? '' : `hover:${theme.buttonPrimaryHover}`} ${theme.buttonText} shadow-md`,
                    size: 'large'
                }}
                cancelButtonProps={{ size: 'large' }}
                centered
                // Applying theme to the modal content itself and its dropdowns
                className={`${theme.cardBg} ${theme.text} ${theme.border}`} // Background, text, border for modal content
            // Note: wrapClassName applies to the mask and content wrapper, useful if you need full modal background change
            // But for content background, className is usually sufficient with Ant Design
            >
                <div className="space-y-6">
                    <div>
                        <label className={`block mb-2 ${theme.successColor} font-medium`}>
                            Select Date
                        </label>
                        <input
                            type="date"
                            value={selectedDate ? selectedDate.format('YYYY-MM-DD') : ''}
                            onChange={(e) => {
                                const date = moment(e.target.value);
                                if (date.isSameOrAfter(moment().startOf('day'))) {
                                    setSelectedDate(date);
                                } else {
                                    message.warning('Cannot select a date in the past.');
                                }
                            }}
                            min={moment().format('YYYY-MM-DD')}
                            className={`w-full border-2 ${theme.border} ${theme.cardBg} ${theme.text} rounded-lg focus:ring-${theme.highlight.replace('text-', '')} focus:border-${theme.highlight.replace('text-', '')} w-full h-[45px] px-3`}
                        />
                        {selectedDate && selectedDate.isBefore(moment().startOf('day')) && (
                            <p className={`${theme.errorColor} text-sm mt-2`}>Cannot select a date in the past.</p>
                        )}
                    </div>

                    {/* Problem Selector */}
                    <div>
                        <label className={`block mb-2 ${theme.successColor} font-medium`}>Select Problem</label>
                        <Select
                            showSearch
                            style={{
                                width: '100%',
                                height: '45px',
                                backgroundColor: theme.cardBg.replace('bg-', ''),
                                color: theme.text.replace('text-', ''),
                                borderColor: theme.border.replace('border-', '')
                            }}
                            placeholder="Search and select a problem..."
                            optionFilterProp="children"
                            onChange={setSelectedProblemId}
                            value={selectedProblemId}
                            filterOption={filterProblemOption}
                            className={`border ${theme.border} rounded-lg`}
                            dropdownStyle={{
                                backgroundColor: theme.cardBg.replace('bg-', ''),
                                color: theme.text.replace('text-', ''),
                                borderColor: theme.border.replace('border-', '')
                            }}
                        >
                            {problems.map(problem => (
                                <Option
                                    key={problem._id}
                                    value={problem._id}
                                    style={{
                                        backgroundColor: theme.cardBg.replace('bg-', ''),
                                        color: theme.text.replace('text-', ''),
                                    }}
                                    className={`hover:${theme.primaryHover} hover:${theme.buttonText}`}
                                >
                                    {problem.title} ({problem.difficulty})
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DailyChallengeAdmin;