import React, { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, message, Modal, Select } from 'antd';
import {
    FireOutlined,
    CalendarOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
import axiosClient from '../../../api/axiosClient';
import moment from 'moment';

import { useTheme } from '../../../context/ThemeContext';

const { Option } = Select;

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
    // State now explicitly holds a moment object
    const [selectedDate, setSelectedDate] = useState(moment().startOf('day')); // Initialize with local today's midnight
    const [isEditing, setIsEditing] = useState(false);

    // Custom Ant Design styles for dark theme integration
    useEffect(() => {
        const style = document.createElement('style');
        style.id = 'ant-table-custom-styles';
        style.innerHTML = `
            .ant-table {
                background-color: ${theme.cardBg.replace('bg-', '')};
                border: 1px solid ${theme.border.replace('border-', '')};
                border-radius: 0.75rem;
                overflow: hidden;
            }
            .ant-table-wrapper {
                background-color: ${theme.cardBg.replace('bg-', '')};
            }
            .ant-table-thead > tr > th {
                background-color: ${theme.cardBg.replace('bg-', '')};
                color: ${theme.highlightSecondary.replace('text-', '')};
                border-bottom: 1px solid ${theme.border.replace('border-', '')};
                font-weight: 600;
                text-align: left;
            }
            .ant-table-tbody > tr.ant-table-row:hover > td {
                background-color: ${theme.background.replace('bg-', '')} !important;
            }
            .ant-table-tbody > tr > td {
                color: ${theme.cardText.replace('text-', '')};
                border-bottom: 1px solid ${theme.border.replace('border-', '')};
            }
            .ant-pagination-item-link,
            .ant-pagination-item {
                background-color: ${theme.background.replace('bg-', '')} !important;
                border: 1px solid ${theme.border.replace('border-', '')} !important;
                color: ${theme.cardText.replace('text-', '')} !important;
            }
            .ant-pagination-item-active {
                background-color: ${theme.primary.replace('bg-', '')} !important;
                border-color: ${theme.primary.replace('bg-', '')} !important;
                color: ${theme.buttonText.replace('text-', '')} !important;
            }
            .ant-pagination-prev .ant-pagination-item-link,
            .ant-pagination-next .ant-pagination-item-link {
                background-color: ${theme.background.replace('bg-', '')} !important;
                border: 1px solid ${theme.border.replace('border-', '')} !important;
                color: ${theme.cardText.replace('text-', '')} !important;
            }
            .ant-pagination-disabled .ant-pagination-item-link,
            .ant-pagination-disabled .ant-pagination-item {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .ant-table-filter-trigger {
                color: ${theme.text.replace('text-', '')};
            }
            .ant-table-column-sorter-up, .ant-table-column-sorter-down {
                color: ${theme.highlight.replace('text-', '')};
            }

            /* Antd Select Dropdown Custom Styles */
            .ant-select-dropdown {
                background-color: ${theme.cardBg.replace('bg-', '')} !important;
                border: 1px solid ${theme.border.replace('border-', '')} !important;
                border-radius: 0.5rem !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
            }
            .ant-select-item-option-content {
                color: ${theme.text.replace('text-', '')} !important;
            }
            .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
                background-color: ${theme.primary.replace('bg-', '')} !important;
                color: ${theme.buttonText.replace('text-', '')} !important;
            }
            .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
                background-color: ${theme.primaryHover.replace('bg-', '')} !important;
                color: ${theme.buttonText.replace('text-', '')} !important;
            }
            .ant-select-selector {
                background-color: ${theme.cardBg.replace('bg-', '')} !important;
                border: 1px solid ${theme.border.replace('border-', '')} !important;
                color: ${theme.text.replace('text-', '')} !important;
            }
            .ant-select-arrow {
                color: ${theme.cardText.replace('text-', '')} !important;
            }
            /* Basic styling for HTML date input to blend with theme */
            input[type="date"] {
                appearance: none;
                -webkit-appearance: none;
                -moz-appearance: none;
                background-color: ${theme.cardBg.replace('bg-', '')};
                border: 2px solid ${theme.border.replace('border-', '')};
                color: ${theme.text.replace('text-', '')};
                padding: 0.75rem 1rem;
                border-radius: 0.5rem;
                font-size: 1rem;
                line-height: 1.5;
                height: 45px;
                box-shadow: none;
                transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
            }
            input[type="date"]:focus {
                outline: none;
                border-color: ${theme.highlight.replace('text-', '')};
                box-shadow: 0 0 0 2px ${theme.highlight.replace('text-', '')}60;
            }
            input[type="date"]::-webkit-calendar-picker-indicator {
                filter: ${theme.text.includes('white') ? 'invert(1)' : 'none'};
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);

        return () => {
            const existingStyle = document.getElementById('ant-table-custom-styles');
            if (existingStyle) {
                existingStyle.remove();
            }
        };
    }, [theme]);


    const columns = [
        {
            title: 'Date',
            dataIndex: 'dailyChallengeDate',
            key: 'date',
            render: (date, record) => (
                <div className="flex items-center">
                    <CalendarOutlined className={`mr-2 ${theme.infoColor}`} />
                    {/* Convert backend UTC date to local for display */}
                    <span>{moment.utc(date).local().format('MMMM Do, YYYY')}</span>
                    {record.isCurrentActive && (
                        <Tag color="cyan" className="ml-2">TODAY</Tag>
                    )}
                </div>
            ),
            // Sorter should use UTC values for consistent sorting
            sorter: (a, b) => moment.utc(a.dailyChallengeDate).valueOf() - moment.utc(b.dailyChallengeDate).valueOf(),
            defaultSortOrder: 'descend',
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
                        className={`flex items-center justify-center ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText}`}
                    >
                        Edit
                    </Button>
                    <Button
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record._id, record.title)}
                        className={`flex items-center justify-center bg-red-600 hover:bg-red-700 ${theme.buttonText} border-red-600`}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    useEffect(() => {
        fetchScheduledAndHistoricalChallenges();
        fetchProblems();
    }, []);

    const fetchScheduledAndHistoricalChallenges = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/problem/daily/all');
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

        let nextDate = moment().startOf('day');
        console.log(moment().startOf('day'));


        if (challenges.length > 0) {
            const latestChallengeDate = challenges.reduce((latest, current) => {
                const currentDateLocal = moment.utc(current.dailyChallengeDate).local().startOf('day');
                return currentDateLocal.isAfter(latest) ? currentDateLocal : latest;
            }, moment().subtract(2, 'day').startOf('day'));

            if (latestChallengeDate.isSameOrAfter(moment().startOf('day'), 'day')) {
                nextDate = latestChallengeDate.add(2, 'day').startOf('day');
                console.log(nextDate);

            } else {
                nextDate = moment().startOf('day');
            }
        }
        setSelectedDate(nextDate); // Set as moment object
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        if (!selectedProblemId) {
            message.warning('Please select a problem for the daily challenge.');
            return;
        }

        // SelectedDate is already a moment object from the state
        if (!selectedDate || selectedDate.isBefore(moment().startOf('day'), 'day')) {
            message.warning('Please select today\'s date or a future date.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                problemId: selectedProblemId,
                // Convert the moment object (local time, start of day) to ISO UTC string for backend.
                date: selectedDate.toISOString()
            };

            await axiosClient.post('/problem/daily/set', payload);
            message.success(`Daily challenge set successfully for ${selectedDate.format('YYYY-MM-DD')}!`);

            setModalVisible(false);
            setSelectedProblemId(null);
            setSelectedDate(moment().startOf('day')); // Reset to today's local start of day
            fetchScheduledAndHistoricalChallenges();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to set daily challenge. Please check console for details.';
            message.error(errorMessage);
            console.error("Error setting daily challenge:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (historyRecordId, challengeTitle) => {
        Modal.confirm({
            title: 'Confirm Removal',
            icon: <QuestionCircleOutlined className={`${theme.warningColor}`} />,
            content: `Are you sure you want to remove the daily challenge record for "${challengeTitle}"? This will delete its history entry and unset it if it's the current active challenge.`,
            okText: 'Remove',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                setLoading(true);
                try {
                    await axiosClient.delete(`/problem/daily/history/${historyRecordId}`);
                    message.success(`Daily challenge record for "${challengeTitle}" removed successfully!`);
                    fetchScheduledAndHistoricalChallenges();
                } catch (err) {
                    message.error('Failed to remove daily challenge record. Please try again.');
                    console.error("Error deleting daily challenge record:", err);
                } finally {
                    setLoading(false);
                }
            },
            onCancel() {
                console.log('Cancel removing daily challenge');
            },
            okButtonProps: { className: `bg-red-600 hover:bg-red-700 ${theme.buttonText}` },
            cancelButtonProps: { className: `${theme.cardBg} ${theme.text} border-${theme.border.replace('border-', '')} hover:${theme.cardBg}/80` }
        });
    };

    const handleEdit = (record) => {
        setIsEditing(true);
        setSelectedProblemId(record.problemId);
        // Convert backend UTC date to local moment object for pre-population
        setSelectedDate(moment.utc(record.dailyChallengeDate).local().startOf('day'));
        setModalVisible(true);
    };

    const filterProblemOption = (input, option) =>
        option.children && option.children.toLowerCase().includes(input.toLowerCase());

    const todayForMinAttribute = moment().format('YYYY-MM-DD'); // Only used for the min attribute

    return (
        <div className={`daily-challenge-admin p-6 ${theme.background} ${theme.text}`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-3xl font-bold flex items-center ${theme.text}`}>
                    <FireOutlined className={`mr-2 ${theme.highlight}`} />
                    Daily Challenges Management
                </h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                    className={`flex items-center justify-center ${theme.buttonPrimary} hover:${theme.buttonPrimaryHover} ${theme.buttonText}`}
                    size="large"
                >
                    Set New Challenge
                </Button>
            </div>

            <Card
                title={
                    <div className="flex items-center">
                        <CalendarOutlined className={`mr-2 text-lg ${theme.infoColor}`} />
                        <span className={`text-xl font-semibold ${theme.highlightTertiary}`}>
                            Scheduled & Historical Daily Challenges
                        </span>
                    </div>
                }
                bordered={false}
                className={`shadow-lg rounded-xl ${theme.cardBg} ${theme.border}`}
                headStyle={{ borderBottom: `1px solid ${theme.border.replace('border-', '')}` }}
                bodyStyle={{ padding: 0 }}
            >
                <Table
                    columns={columns}
                    dataSource={challenges}
                    loading={loading}
                    rowKey="_id"
                    pagination={{
                        pageSize: 10,
                        className: 'mt-4',
                        showSizeChanger: false,
                        itemRender: (current, type, originalElement) => {
                            if (type === 'prev') return <a className={`${theme.cardText}`}>Previous</a>;
                            if (type === 'next') return <a className={`${theme.cardText}`}>Next</a>;
                            return originalElement;
                        }
                    }}
                    size="large"
                />
            </Card>

            <Modal
                title={isEditing ? (
                    <div className="flex items-center">
                        <EditOutlined className={`mr-2 text-lg ${theme.infoColor}`} />
                        <span className="text-xl font-semibold">Edit Daily Challenge</span>
                    </div>
                ) : (
                    <div className="flex items-center">
                        <PlusOutlined className={`mr-2 text-lg ${theme.successColor}`} />
                        <span className="text-xl font-semibold">Set New Daily Challenge</span>
                    </div>
                )}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => {
                    setModalVisible(false);
                    setIsEditing(false);
                    setSelectedProblemId(null);
                    setSelectedDate(moment().startOf('day')); // Reset to today's local start of day
                }}
                confirmLoading={loading}
                width={600}
                okText={isEditing ? "Update Challenge" : "Set Challenge"}
                okButtonProps={{
                    className: `flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : theme.buttonPrimary} ${loading ? '' : `hover:${theme.buttonPrimaryHover}`} ${theme.buttonText} shadow-md`,
                    size: 'large'
                }}
                cancelButtonProps={{ size: 'large', className: `${theme.cardBg} ${theme.text} border-${theme.border.replace('border-', '')} hover:${theme.cardBg}/80` }}
                centered
                className={`${theme.cardBg} ${theme.text} ${theme.border} rounded-xl`}
                wrapClassName="daily-challenge-modal-wrapper"
            >
                <div className="space-y-6">
                    <div>
                        <label className={`block mb-2 ${theme.successColor} font-medium`}>
                            Select Date
                        </label>
                        <input
                            type="date"
                            // If selectedDate is a moment object, format it for the input's value
                            value={selectedDate ? selectedDate.format('YYYY-MM-DD') : ''}
                            onChange={(e) => {
                                const newDateValue = e.target.value; // This is the YYYY-MM-DD string
                                if (!newDateValue) { // Handle clearing the input
                                    setSelectedDate(null);
                                    return;
                                }
                                const dateMoment = moment(newDateValue); // Parse the string into a moment object (local time)

                                // Validate against local 'today'
                                if (dateMoment.isSameOrAfter(moment().startOf('day'))) {
                                    setSelectedDate(dateMoment); // Update state with the moment object
                                } else {
                                    message.warning('Cannot select a date in the past.');
                                    // Optionally, revert the input value display here if you want to visually enforce
                                    // For now, it will keep the invalid date in the input until a valid one is picked
                                    // or the modal is closed. This is browser-dependent behavior for type="date".
                                }
                            }}
                            min={todayForMinAttribute} // Disable dates before today
                            className={`w-full border-2 ${theme.border} ${theme.cardBg} ${theme.text} rounded-lg focus:ring-${theme.highlight.replace('text-', '')} focus:border-${theme.highlight.replace('text-', '')} w-full h-[45px] px-3`}
                        />
                    </div>

                    <div>
                        <label className={`block mb-2 ${theme.successColor} font-medium`}>Select Problem</label>
                        <Select
                            showSearch
                            style={{
                                width: '100%',
                                height: '45px',
                            }}
                            placeholder="Search and select a problem..."
                            optionFilterProp="children"
                            onChange={setSelectedProblemId}
                            value={selectedProblemId}
                            filterOption={filterProblemOption}
                            className={`border ${theme.border} rounded-lg`}
                        >
                            {problems.map(problem => (
                                <Option
                                    key={problem._id}
                                    value={problem._id}
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