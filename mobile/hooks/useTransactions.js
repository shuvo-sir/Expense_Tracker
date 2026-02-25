// react custom hooks file
import { useState, useEffect, useCallback } from 'react'; // ✅ make sure useCallback is here
import { Alert } from 'react-native';

const API_URL = 'https://expense-tracker-2-kdar.onrender.com/api'; // Replace with your actual API URL

export const useTransactions = (userId) => {
    // Here you can implement the logic to fetch transactions for the given userId
    // For example, you can use useState and useEffect to manage the state and side effects
    // This is just a placeholder implementation and should be replaced with actual logic to fetch transactions
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({
        balance: 0,
        income: 0,
        expenses: 0,
    });
    const [isLoading, setIsLoading] = useState(true);


    // useCallback is user for performance reasons, it will memoize the function
    const fetchTransactions = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/transactions/${userId}`);
            const data = await response.json();
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    }, [userId]);



    const fetchSummary = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/transactions/summary/${userId}`);
            const data = await response.json();
            setSummary(data);
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    }, [userId]);


    const loadData = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            // Use Promise.all to fetch transactions and summary in parallel
            await Promise.all([fetchTransactions(), fetchSummary()]);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [fetchTransactions, fetchSummary]);


    // Delete transaction function
    const deleteTransaction = async (id) => {
        try {
            const response = await fetch(`${API_URL}/transactions/${id}`,
                {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error('Failed to delete transaction');
                }
                // After successful deletion, refresh the transactions and summary
                await loadData();
                Alert.alert('Success', 'Transaction deleted successfully');
        } catch (error) {
            console.error('Error deleting transaction:', error);
            Alert.alert('Error', 'Failed to delete transaction');
        }
    }

    return {
        transactions,
        summary,
        isLoading,
        loadData,
        deleteTransaction,
    }
}