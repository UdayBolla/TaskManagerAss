import { Component } from "react";
import { useNavigate } from 'react-router-dom';

class Add extends Component {
    // Initialize state with default values and for loading/errors
    state = {
        title: '',
        description: '',
        status: 'todo', // Set 'todo' as default status
        dueDate: '',
        isLoading: false, // For submission loading state
        formError: ''   // For displaying form-level errors
    }

    onSubmitForm = async event => {
        event.preventDefault();

        const { title, description, status, dueDate } = this.state;

        // --- Client-side Validation ---
        if (!title.trim()) {
            this.setState({ formError: 'Task title is required.' });
            return; // Stop the submission
        }
        const validStatuses = ['todo', 'in_progress', 'done'];
        if (!status || !validStatuses.includes(status)) {
            this.setState({ formError: `Invalid status selected. Must be one of: ${validStatuses.join(', ')}` });
            return;
        }
        // --- End Client-side Validation ---

        this.setState({ isLoading: true, formError: '' }); // Set loading, clear previous error

        // Construct the task details object for the API
        const taskDetails = {
            title,
            description: description || null, // Send null if description is empty
            status,
            dueDate: dueDate || null // Send null if due date is empty
        };

        try {
            const res = await fetch(`https://taskmanagerass-backend6.onrender.com`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskDetails)
            });

            const data = await res.json(); // Always try to parse JSON for more specific errors

            if (!res.ok) {
                // If response is not OK, display the backend's error message or a generic one
                this.setState({ formError: data.message || 'Failed to add task.', isLoading: false });
            } else {
                console.log('Task added:', data);
                this.setState({ isLoading: false });
                // Redirect to '/home' (or '/') after successful addition
                this.props.navigate('/home', { replace: true });
            }
        } catch (err) {
            console.error("Network or server error:", err);
            this.setState({ formError: 'Failed to connect with server. Please check if the backend is running.', isLoading: false });
        }
    }

    // Handlers for input changes, updating state
    onChangeTitle = event => { this.setState({ title: event.target.value }) }
    onChangeDescription = event => { this.setState({ description: event.target.value }) }
    onChangeStatus = event => { this.setState({ status: event.target.value }) }
    onChangeDate = event => { this.setState({ dueDate: event.target.value }) }

    render() {
        const { title, description, status, dueDate, isLoading, formError } = this.state;

        return (
            <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '25px', color: '#333' }}>Add New Task</h1>
                {formError && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{formError}</p>}
                <div>
                    <form onSubmit={this.onSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label htmlFor="title" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title:</label>
                            <input
                                id='title'
                                type='text'
                                value={title}
                                onChange={this.onChangeTitle}
                                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                                required // HTML5 required attribute
                            />
                        </div>
                        <div>
                            <label htmlFor="description" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description:</label>
                            {/* Corrected to use <textarea> for multiline input */}
                            <textarea
                                id='description'
                                value={description}
                                onChange={this.onChangeDescription}
                                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' }}
                            ></textarea>
                        </div>
                        <div>
                            <label htmlFor="status" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status:</label>
                            {/* The 'value' prop on <select> controls the selected option. Removed 'selected' from options. */}
                            <select
                                id='status'
                                onChange={this.onChangeStatus}
                                value={status}
                                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                                required
                            >
                                <option value='todo'>Todo</option>
                                <option value='in_progress'>In Progress</option>
                                <option value='done'>Done</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="dates" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Due Date:</label>
                            <input
                                type='date'
                                id='dates'
                                onChange={this.onChangeDate}
                                value={dueDate}
                                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </div>
                        <button
                            type='submit'
                            disabled={isLoading} // Disable button while loading
                            style={{
                                padding: '10px 20px',
                                backgroundColor: isLoading ? '#6c757d' : '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                fontSize: '1.1em',
                                marginTop: '15px'
                            }}
                        >
                            {isLoading ? 'Adding Task...' : 'Add Task'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }
}

// Higher-order component to inject `useNavigate` into a class component's props
function AddWithRouter(props) {
    const navigate = useNavigate();
    return <Add {...props} navigate={navigate} />;
}

export default AddWithRouter;
