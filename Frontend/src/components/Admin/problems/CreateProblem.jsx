import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosClient from '../../../api/axiosClient';
import ProblemForm from './components/ProblemForm';

const CreateProblem = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateProblem = async (data) => {
        setIsSubmitting(true);
        try {
            await axiosClient.post('/problem/create', data);
            toast.success("Problem created successfully!");
            setTimeout(() => navigate('/admin/problems'), 1000);
        } catch (error) {
            console.error("Backend error response data:", error.response?.data);
            const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleValidationFail = () => {
        toast.error("Please fix the validation errors on the form.");
    };

    return (
        <div>
            <ProblemForm
                onSubmit={handleCreateProblem}
                onValidationFail={handleValidationFail}
                isSubmitting={isSubmitting}
                isEditing={false}
            />
        </div>
    );
};

export default CreateProblem;