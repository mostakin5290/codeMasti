import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosClient from '../../../api/axiosClient';
import LoadingSpinner from '../../common/LoadingSpinner';
import ProblemForm from './components/ProblemForm';

const EditProblem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const response = await axiosClient.get(`/problem/problemByIdForAdmin/${id}`);
                const fetchedData = response.data;

                // Ensure executionConfig and other fields are propagated
                const sanitizedData = {
                    ...fetchedData,
                    tags: fetchedData.tags || [],
                    visibleTestCases: fetchedData.visibleTestCases || [], // No need to stringify here; ProblemForm handles it
                    hiddenTestCases: fetchedData.hiddenTestCases || [],   // No need to stringify here; ProblemForm handles it
                    starterCode: fetchedData.starterCode || [],
                    referenceSolution: fetchedData.referenceSolution || [],
                    executionConfig: fetchedData.executionConfig || null, // Ensure executionConfig is passed
                };

                setInitialData(sanitizedData);
            } catch (error) {
                console.error("Error fetching problem:", error); // Log error for debugging
                toast.error("Could not fetch problem data. Redirecting...");
                setTimeout(() => navigate('/admin/problems'), 2000);
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
    }, [id, navigate]);

    const handleUpdateProblem = async (data) => {
        setIsSubmitting(true);
        toast.info("Updating problem...");
        try {
            await axiosClient.put(`/problem/update/${id}`, data);
            toast.success("Problem updated successfully!");
            setTimeout(() => navigate('/admin/problems'), 1500);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to update problem.";
            console.error("Error updating problem:", error); // Log error for debugging
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleValidationFail = () => {
        toast.error("Please fix the validation errors.");
    };

    if (loading) return <LoadingSpinner />;
    // Check for initialData.title as a more robust check that data loaded properly
    if (!initialData || !initialData.title) return <div className="text-center text-xl text-warning">Could not load problem data.</div>;

    return (
        <div>
            <ProblemForm
                initialData={initialData}
                onSubmit={handleUpdateProblem}
                onValidationFail={handleValidationFail}
                isSubmitting={isSubmitting}
                isEditing={true}
            />
        </div>
    );
};

export default EditProblem;