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

const DailyChallengeAdmin = () => {
    const { theme } = useTheme();

    const [challenges, setChallenges] = useState([]);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProblemId, setSelectedProblemId] = useState(null);
    // Use plain date string instead of moment object to avoid timezone issues
    const [selectedDate, setSelectedDate] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Custom Ant Design styles for dark theme integration
    useEffect(() => {
        const style = document.createElement('style');
        style.id = 'ant-table-custom-styles';
        style.innerHTML = `
            .ant-table {
                background-color: ${theme.cardBg?.replace('bg-', '') || '#1f2937'};
                border: 1px solid ${theme.border?.replace('border-', '') || '#374151'};
                border-radius: 0.75rem;
                overflow: hidden;
            }
            .ant-table-wrapper {
                background-color: ${theme.cardBg?.replace('bg-', '') || '#1f2937'};
            }
            .ant-table-thead > tr > th {
                background-color: ${theme.cardBg?.replace('bg-', '') || '#1f2937'};
                color: ${theme.highlightSecondary?.replace('text-', '') || '#60a5fa'};
                border-bottom: 1px solid ${theme.border?.replace('border-', '') || '#374151'};
                font-weight: 600;
                text-align: left;
            }
            .ant-table-tbody > tr.ant-table-row:hover > td {
                background-color: ${theme.background?.replace('bg-', '') || '#111827'} !important;
            }
            .ant-table-tbody > tr > td {
                color: ${theme.cardText?.replace('text-', '') || '#d1d5db'};
                border-bottom: 1px solid ${theme.border?.replace('border-', '') || '#374151'};
            }
            .ant-pagination-item-link,
            .ant-pagination-item {
                background-color: ${theme.background?.replace('bg-', '') || '#111827'} !important;
                border: 1px solid ${theme.border?.replace('border-', '') || '#374151'} !important;
                color: ${theme.cardText?.replace('text-', '') || '#d1d5db'} !important;
            }
            .ant-pagination-item-active {
                background-color: ${theme.primary?.replace('bg-', '') || '#3b82f6'} !important;
                border-color: ${theme.primary?.replace('bg-', '') || '#3b82f6'} !important;
                color: ${theme.buttonText?.replace('text-', '') || '#ffffff'} !important;
            }
            .ant-pagination-prev .ant-pagination-item-link,
            .ant-pagination-next .ant-pagination-item-link {
                background-color: ${theme.background?.replace('bg-', '') || '#111827'} !important;
                border: 1px solid ${theme.border?.replace('border-', '') || '#374151'} !important;
                color: ${theme.cardText?.replace('text-', '') || '#d1d5db'} !important;
            }
            .ant-pagination-disabled .ant-pagination-item-link,
            .ant-pagination-disabled .ant-pagination-item {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .ant-table-filter-trigger {
                color: ${theme.text?.replace('text-', '') || '#ffffff'};
            }
            .ant-table-column-sorter-up, .ant-table-column-sorter-down {
                color: ${theme.highlight?.replace('text-', '') || '#22d3ee'};
            }

            /* Antd Select Dropdown Custom Styles */
            .ant-select-dropdown {
                background-color: ${theme.cardBg?.replace('bg-', '') || '#1f2937'} !important;
                border: 1px solid ${theme.border?.replace('border-', '') || '#374151'} !important;
                border-radius: 0.5rem !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
            }
            .ant-select-item-option-content {
                color: ${theme.text?.replace('text-', '') || '#ffffff'} !important;
            }
            .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
                background-color: ${theme.primary?.replace('bg-', '') || '#3b82f6'} !important;
                color: ${theme.buttonText?.replace('text-', '') || '#ffffff'} !important;
            }
            .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
                background-color: ${theme.primaryHover?.replace('bg-', '') || '#2563eb'} !important;
                color: ${theme.buttonText?.replace('text-', '') || '#ffffff'} !important;
            }
            .ant-select-selector {
                background-color: ${theme.cardBg?.replace('bg-', '') || '#1f2937'} !important;
                border: 1px solid ${theme.border?.replace('border-', '') || '#374151'} !important;
                color: ${theme.text?.replace('text-', '') || '#ffffff'} !important;
            }
            .ant-select-arrow {
                color: ${theme.cardText?.replace('text-', '') || '#d1d5db'} !important;
            }
            /* Basic styling for HTML date input to blend with theme */
            input[type="date"] {
                appearance: none;
                -webkit-appearance: none;
                -moz-appearance: none;
                background-color: ${theme.cardBg?.replace('bg-', '') || '#1f2937'};
                border: 2px solid ${theme.border?.replace('border-', '') || '#374151'};
                color: ${theme.text?.replace('text-', '') || '#ffffff'};
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
                border-color: ${theme.highlight?.replace('text-', '') || '#22d3ee'};
                box-shadow: 0 0 0 2px ${theme.highlight?.replace('text-', '') || '#22d3ee'}60;
            }
            input[type="date"]::-webkit-calendar-picker-indicator {
                filter: ${theme.text?.includes('white') ? 'invert(1)' : 'none'};
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
                    <CalendarOutlined className={`mr-2 ${theme.infoColor || 'text-blue-400'}`} />
                    {/* Display date as YYYY-MM-DD format to avoid timezone confusion */}
                    <span>{moment.utc(date).format('YYYY-MM-DD')}</span>
                    {record.isCurrentActive && (
                        <Tag color="cyan" className="ml-2">TODAY</Tag>
                    )}
                </div>
            ),
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
                        className={`flex items-center justify-center ${theme.buttonPrimary || 'bg-indigo-600'} hover:${theme.buttonPrimaryHover || 'bg-indigo-700'} ${theme.buttonText || 'text-white'}`}
                    >
                        Edit
                    </Button>
                    <Button
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record._id, record.title)}
                        className={`flex items-center justify-center bg-red-600 hover:bg-red-700 ${theme.buttonText || 'text-white'} border-red-600`}
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

        // Get next available date in YYYY-MM-DD format
        let nextDate = moment().format('YYYY-MM-DD');

        if (challenges.length > 0) {
            // Find the latest challenge date
            const latestChallengeDate = challenges.reduce((latest, current) => {
                const currentDate = moment.utc(current.dailyChallengeDate).format('YYYY-MM-DD');
                return currentDate > latest ? currentDate : latest;
            }, moment().subtract(1, 'day').format('YYYY-MM-DD'));

            // If latest date is today or in the future, suggest next day
            if (latestChallengeDate >= moment().format('YYYY-MM-DD')) {
                nextDate = moment(latestChallengeDate).add(1, 'day').format('YYYY-MM-DD');
            }
        }

        setSelectedDate(nextDate);
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        if (!selectedProblemId) {
            message.warning('Please select a problem for the daily challenge.');
            return;
        }

        if (!selectedDate || selectedDate < moment().format('YYYY-MM-DD')) {
            message.warning('Please select today\'s date or a future date.');
            return;
        }

        setLoading(true);
        try {
            // Create a UTC date object from the selected date string
            // This ensures the date is sent as the exact date selected, not shifted by timezone
            const utcDate = moment.utc(selectedDate + ' 00:00:00', 'YYYY-MM-DD HH:mm:ss');
            
            const payload = {
                problemId: selectedProblemId,
                date: utcDate.toISOString() // Send as UTC ISO string
            };

            console.log('Sending payload:', payload);
            console.log('Selected date:', selectedDate);
            console.log('UTC date being sent:', utcDate.format('YYYY-MM-DD HH:mm:ss UTC'));

            await axiosClient.post('/problem/daily/set', payload);
            message.success(`Daily challenge set successfully for ${selectedDate}!`);

            setModalVisible(false);
            setSelectedProblemId(null);
            setSelectedDate('');
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
            icon: <QuestionCircleOutlined className={`${theme.warningColor || 'text-amber-400'}`} />,
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
            okButtonProps: { className: `bg-red-600 hover:bg-red-700 ${theme.buttonText || 'text-white'}` },
            cancelButtonProps: { className: `${theme.cardBg || 'bg-gray-800'} ${theme.text || 'text-white'} border-${theme.border?.replace('border-', '') || 'gray-700'} hover:${theme.cardBg || 'bg-gray-800'}/80` }
        });
    };

    const handleEdit = (record) => {
        setIsEditing(true);
        setSelectedProblemId(record.problemId);
        // Extract just the date part from the UTC date to avoid timezone issues
        setSelectedDate(moment.utc(record.dailyChallengeDate).format('YYYY-MM-DD'));
        setModalVisible(true);
    };

    const filterProblemOption = (input, option) =>
        option.children && option.children.toLowerCase().includes(input.toLowerCase());

    const todayForMinAttribute = moment().format('YYYY-MM-DD');

    return (
        <div className={`daily-challenge-admin p-6 ${theme.background || 'bg-gray-900'} ${theme.text || 'text-white'}`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-3xl font-bold flex items-center ${theme.text || 'text-white'}`}>
                    <FireOutlined className={`mr-2 ${theme.highlight || 'text-cyan-400'}`} />
                    Daily Challenges Management
                </h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                    className={`flex items-center justify-center ${theme.buttonPrimary || 'bg-indigo-600'} hover:${theme.buttonPrimaryHover || 'bg-indigo-700'} ${theme.buttonText || 'text-white'}`}
                    size="large"
                >
                    Set New Challenge
                </Button>
            </div>

            <Card
                title={
                    <div className="flex items-center">
                        <CalendarOutlined className={`mr-2 text-lg ${theme.infoColor || 'text-blue-400'}`} />
                        <span className={`text-xl font-semibold ${theme.highlightTertiary || 'text-purple-400'}`}>
                            Scheduled & Historical Daily Challenges
                        </span>
                    </div>
                }
                bordered={false}
                className={`shadow-lg rounded-xl ${theme.cardBg || 'bg-gray-800'} ${theme.border || 'border-gray-700'}`}
                headStyle={{ borderBottom: `1px solid ${theme.border?.replace('border-', '') || '#374151'}` }}
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
                            if (type === 'prev') return <a className={`${theme.cardText || 'text-gray-300'}`}>Previous</a>;
                            if (type === 'next') return <a className={`${theme.cardText || 'text-gray-300'}`}>Next</a>;
                            return originalElement;
                        }
                    }}
                    size="large"
                />
            </Card>

            <Modal
                title={isEditing ? (
                    <div className="flex items-center">
                        <EditOutlined className={`mr-2 text-lg ${theme.infoColor || 'text-blue-400'}`} />
                        <span className="text-xl font-semibold">Edit Daily Challenge</span>
                    </div>
                ) : (
                    <div className="flex items-center">
                        <PlusOutlined className={`mr-2 text-lg ${theme.successColor || 'text-emerald-400'}`} />
                        <span className="text-xl font-semibold">Set New Daily Challenge</span>
                    </div>
                )}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => {
                    setModalVisible(false);
                    setIsEditing(false);
                    setSelectedProblemId(null);
                    setSelectedDate('');
                }}
                confirmLoading={loading}
                width={600}
                okText={isEditing ? "Update Challenge" : "Set Challenge"}
                okButtonProps={{
                    className: `flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : theme.buttonPrimary || 'bg-indigo-600'} ${loading ? '' : `hover:${theme.buttonPrimaryHover || 'bg-indigo-700'}`} ${theme.buttonText || 'text-white'} shadow-md`,
                    size: 'large'
                }}
                cancelButtonProps={{ 
                    size: 'large', 
                    className: `${theme.cardBg || 'bg-gray-800'} ${theme.text || 'text-white'} border-${theme.border?.replace('border-', '') || 'gray-700'} hover:${theme.cardBg || 'bg-gray-800'}/80` 
                }}
                centered
                className={`${theme.cardBg || 'bg-gray-800'} ${theme.text || 'text-white'} ${theme.border || 'border-gray-700'} rounded-xl`}
                wrapClassName="daily-challenge-modal-wrapper"
            >
                <div className="space-y-6">
                    <div>
                        <label className={`block mb-2 ${theme.successColor || 'text-emerald-400'} font-medium`}>
                            Select Date
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => {
                                const newDateValue = e.target.value;
                                console.log('Date selected:', newDateValue);
                                
                                if (!newDateValue) {
                                    setSelectedDate('');
                                    return;
                                }

                                // Validate against today's date
                                if (newDateValue >= todayForMinAttribute) {
                                    setSelectedDate(newDateValue);
                                } else {
                                    message.warning('Cannot select a date in the past.');
                                }
                            }}
                            min={todayForMinAttribute}
                            className={`w-full border-2 ${theme.border || 'border-gray-700'} ${theme.cardBg || 'bg-gray-800'} ${theme.text || 'text-white'} rounded-lg focus:ring-${theme.highlight?.replace('text-', '') || 'cyan'} focus:border-${theme.highlight?.replace('text-', '') || 'cyan'} w-full h-[45px] px-3`}
                        />
                        <div className="mt-1 text-sm text-gray-400">
                            Selected: {selectedDate ? selectedDate : 'No date selected'}
                        </div>
                    </div>

                    <div>
                        <label className={`block mb-2 ${theme.successColor || 'text-emerald-400'} font-medium`}>Select Problem</label>
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
                            className={`border ${theme.border || 'border-gray-700'} rounded-lg`}
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
