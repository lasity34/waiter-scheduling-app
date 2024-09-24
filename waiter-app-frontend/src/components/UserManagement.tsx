import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { fetchUsers, createUser, updateUser, deleteUser } from "../api";

const UserManagementContainer = styled.div`
  padding: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  max-width: 300px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const UserList = styled.div`
  margin-top: 20px;
`;

const UserGroup = styled.div`
  margin-bottom: 15px;
`;

const UserGroupTitle = styled.h4`
  margin-bottom: 10px;
`;

const UserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 5px;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserActions = styled.div`
  display: flex;
  gap: 5px;
`;

const ActionButton = styled(Button)`
  font-size: 0.8rem;
  padding: 5px 10px;
`;

const ToggleButton = styled(ActionButton)`
  background-color: #28a745;

  &:hover {
    background-color: #218838;
  }
`;

const RemoveButton = styled(ActionButton)`
  background-color: #dc3545;

  &:hover {
    background-color: #c82333;
  }
`;

const ConfirmationPopup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const ConfirmationText = styled.p`
  margin-bottom: 15px;
`;

const ConfirmationButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface ConfirmationState {
  isOpen: boolean;
  userId: number | null;
  action: "remove" | "toggle" | null;
  newRole?: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "waiter",
  });
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    userId: null,
    action: null,
  });

  useEffect(() => {
    fetchUsersData();
  }, []);

  const fetchUsersData = async () => {
    try {
      const response = await fetchUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(newUser);
      alert("User created successfully");
      setNewUser({ name: "", email: "", password: "", role: "waiter" });
      fetchUsersData();
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user");
    }
  };

  const openConfirmation = (
    userId: number,
    action: "remove" | "toggle",
    newRole?: string
  ) => {
    setConfirmation({ isOpen: true, userId, action, newRole });
  };

  const closeConfirmation = () => {
    setConfirmation({ isOpen: false, userId: null, action: null });
  };

  const handleConfirm = async () => {
    if (!confirmation.userId || !confirmation.action) return;

    try {
      if (confirmation.action === "remove") {
        await deleteUser(confirmation.userId);
        alert("User has been removed successfully");
      } else if (confirmation.action === "toggle" && confirmation.newRole) {
        await updateUser(confirmation.userId, { role: confirmation.newRole });
        alert(`User's role has been updated to ${confirmation.newRole}`);
      }
      fetchUsersData();
    } catch (error) {
      console.error("Error performing action:", error);
      alert("Failed to perform action");
    }

    closeConfirmation();
  };

  const renderUserList = () => {
    const groupedUsers = users.reduce((acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = [];
      }
      acc[user.role].push(user);
      return acc;
    }, {} as Record<string, User[]>);

    return (
      <UserList>
        {Object.entries(groupedUsers).map(([role, users]) => (
          <UserGroup key={role}>
            <UserGroupTitle>
              {role.charAt(0).toUpperCase() + role.slice(1)}s
            </UserGroupTitle>
            {users.map((user) => (
              <UserItem key={user.id}>
                <UserInfo>
                  <strong>{user.name}</strong> ({user.email})
                </UserInfo>
                <UserActions>
                  <ToggleButton
                    onClick={() =>
                      openConfirmation(
                        user.id,
                        "toggle",
                        user.role === "waiter" ? "manager" : "waiter"
                      )
                    }
                  >
                    {user.role === "waiter" ? "Make Manager" : "Make Waiter"}
                  </ToggleButton>
                  <RemoveButton
                    onClick={() => openConfirmation(user.id, "remove")}
                  >
                    Remove
                  </RemoveButton>
                </UserActions>
              </UserItem>
            ))}
          </UserGroup>
        ))}
      </UserList>
    );
  };

  return (
    <UserManagementContainer>
      <h2>User Management</h2>
      <h3>Create New User</h3>
      <Form onSubmit={handleCreateUser}>
        <Input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          required
        />
        <Select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
        >
          <option value="waiter">Waiter</option>
          <option value="manager">Manager</option>
        </Select>
        <Button type="submit">Create User</Button>
      </Form>

      <h3>User List</h3>
      {renderUserList()}

      {confirmation.isOpen && (
        <ConfirmationPopup>
          <ConfirmationText>
            {confirmation.action === "remove"
              ? "Are you sure you want to remove this user?"
              : `Are you sure you want to change this user's role to ${confirmation.newRole}?`}
          </ConfirmationText>
          <ConfirmationButtons>
            <Button onClick={handleConfirm}>Confirm</Button>
            <Button onClick={closeConfirmation}>Cancel</Button>
          </ConfirmationButtons>
        </ConfirmationPopup>
      )}
    </UserManagementContainer>
  );
};

export default UserManagement;