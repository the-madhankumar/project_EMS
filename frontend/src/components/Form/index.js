import React, { useState, useEffect } from "react";
import { Edit, Trash2, Eraser } from "lucide-react";
import "./index.css";

export default function Form() {
    const [employees, setEmployees] = useState([]);
    const [displayList, setDisplayList] = useState([]);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [department, setDepartment] = useState("");
    const [salary, setSalary] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("All");
    const [salaryFilter, setSalaryFilter] = useState({ min: 0, max: 1000000 });
    const [sortBy, setSortBy] = useState("");

    const backendUrl = "http://localhost:3000/employees";

    const handleAdd = async () => {
        setError(null);
        if (!name || !department || !salary || !email) {
            setError("All fields are required");
            return;
        }
        try {
            const response = await fetch(backendUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, department, salary, email })
            });
            if (!response.ok) {
                const err = await response.json();
                setError(err.message || "Failed to add employee");
                return;
            }
            await handleFetch();
            setName(""); setDepartment(""); setSalary(""); setEmail("");
        } catch {
            setError("Server not reachable");
        }
    };

    const handleUpdate = async () => {
        setError(null);
        if (!id || !name || !department || !salary || !email) {
            setError("All fields are required");
            return;
        }
        try {
            const response = await fetch(`${backendUrl}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, department, salary, email })
            });
            if (!response.ok) {
                const err = await response.json();
                setError(err.message || "Update failed");
                return;
            }
            await handleFetch();
            setId(""); setName(""); setDepartment(""); setSalary(""); setEmail("");
        } catch {
            setError("Server not reachable");
        }
    };

    const handleDelete = async (deleteId) => {
        setError(null);
        if (!deleteId) {
            setError("ID is required");
            return;
        }
        try {
            const response = await fetch(`${backendUrl}/${deleteId}`, { method: "DELETE" });
            if (!response.ok) {
                const err = await response.json();
                setError(err.message || "Delete failed");
                return;
            }
            await handleFetch();
            if (deleteId === id) setId("");
        } catch {
            setError("Server not reachable");
        }
    };

    const handleFetch = async () => {
        setError(null);
        try {
            const response = await fetch(backendUrl);
            if (!response.ok) {
                setError("Failed to fetch employees");
                return;
            }
            const data = await response.json();
            setEmployees(data);
        } catch {
            setError("Server not reachable");
        }
    };

    useEffect(() => {
        let tempList = [...employees];
        if (searchTerm) {
            tempList = tempList.filter(emp =>
                emp.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (departmentFilter && departmentFilter !== "All") {
            tempList = tempList.filter(emp => emp.department === departmentFilter);
        }
        if (salaryFilter) {
            tempList = tempList.filter(emp =>
                emp.salary >= salaryFilter.min && emp.salary <= salaryFilter.max
            );
        }
        if (sortBy === "name") {
            tempList.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === "salaryAsc") {
            tempList.sort((a, b) => a.salary - b.salary);
        } else if (sortBy === "salaryDesc") {
            tempList.sort((a, b) => b.salary - a.salary);
        }
        setDisplayList(tempList);
    }, [employees, searchTerm, departmentFilter, salaryFilter, sortBy]);

    return (
        <div className="container">
            <h2>Employee Management</h2>

            <div className="form">
                {/* <input placeholder="ID" value={id} onChange={e => setId(e.target.value)} /> */}
                <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
                <input placeholder="Department" value={department} onChange={e => setDepartment(e.target.value)} />
                <input placeholder="Salary" value={salary} onChange={e => setSalary(e.target.value)} />
                <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />

                <div className="buttons">
                    <button onClick={handleAdd}>Add</button>
                    <button onClick={handleUpdate}>Update</button>
                    <button onClick={() => handleDelete(id)}>Delete</button>
                    <button onClick={handleFetch}>Fetch</button>
                </div>

                {error && <p className="error">{error}</p>}
            </div>

            <h2>Filters</h2>
            <div className="filters-container">
                <Eraser
                    size={20}
                    onClick={() => {
                        setSearchTerm("");
                        setDepartmentFilter("");
                        setSalaryFilter("");
                        setSortBy("Sort By");
                    }}
                />
                <input placeholder="Search Name" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <input placeholder="Department Filter" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} />
                <input placeholder="Salary Min" type="number" onChange={e => setSalaryFilter({ ...salaryFilter, min: Number(e.target.value) })} />
                <input placeholder="Salary Max" type="number" onChange={e => setSalaryFilter({ ...salaryFilter, max: Number(e.target.value) })} />
                <select onChange={e => setSortBy(e.target.value)}>
                    <option value="">Sort By</option>
                    <option value="name">Name</option>
                    <option value="salaryAsc">Salary Asc</option>
                    <option value="salaryDesc">Salary Desc</option>
                </select>
            </div>


            <table className="employee-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Salary</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {displayList.map(e => (
                        <tr key={e.id}>
                            <td>{e.id}</td>
                            <td>{e.name}</td>
                            <td>{e.department}</td>
                            <td>{e.salary}</td>
                            <td>{e.email}</td>
                            <td className="actions">
                                <Edit
                                    size={20}
                                    color="#1976d2"
                                    style={{ cursor: "pointer", marginRight: "10px" }}
                                    onClick={() => {
                                        setId(e.id);
                                        setName(e.name);
                                        setDepartment(e.department);
                                        setSalary(e.salary);
                                        setEmail(e.email);
                                    }}
                                />
                                <Trash2
                                    size={20}
                                    color="#d32f2f"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleDelete(e.id)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
