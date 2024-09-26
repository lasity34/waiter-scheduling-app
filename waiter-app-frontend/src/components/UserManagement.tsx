import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { fetchUsers, createUser, updateUser, deleteUser, changePassword, resetPasswordRequest } from "../api";

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

const PasswordChangeForm = styled(Form)`
  margin-top: 20px;
`;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  password_set?: boolean;
}

interface ConfirmationState {
  isOpen: boolean;
  userId: number | null;
  action: "remove" | "toggle" | null;
  newRole?: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}


const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<any>({
    name: "",
    email: "",
    role: "waiter",
  });
  const [passwordChangeData, setPasswordChangeData] = useState<PasswordChangeData>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    userId: null,
    action: null,
  });


  useEffect(() => {
    fetchUsersData();
  }, [])


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
      alert("User created successfully. A password setup link has been sent to their email.");
      setNewUser({ name: "", email: "", role: "waiter" });
      fetchUsersData();
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordChangeData.newPassword !== passwordChangeData.confirmNewPassword) {
      alert("New passwords do not match");
      return;
    }
    try {
      await changePassword(passwordChangeData.currentPassword, passwordChangeData.newPassword);
      alert("Password changed successfully");
      setPasswordChangeData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to change password");
    }
  };


  const handleResendPasswordLink = async (userId: number) => {
    try {
      const user = users.find(u => u.id === userId);
      if (user) {
        await resetPasswordRequest(user.email);
        alert("Password setup link has been resent to the user's email.");
      }
    } catch (error) {
      console.error("Error resending password link:", error);
      alert("Failed to resend password link");
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
                  {!user.password_set && <span> - Password not set</span>}
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
                  {!user.password_set && (
                    <ActionButton onClick={() => handleResendPasswordLink(user.id)}>
                      Resend Password Link
                    </ActionButton>
                  )}
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
        <Select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
        >
          <option value="waiter">Waiter</option>
          <option value="manager">Manager</option>
        </Select>
        <Button type="submit">Create User</Button>
      </Form>
      
      <h3>Change Password</h3>
      <PasswordChangeForm onSubmit={handlePasswordChange}>
        <Input
          type="password"
          placeholder="Current Password"
          value={passwordChangeData.currentPassword}
          onChange={(e) => setPasswordChangeData({ ...passwordChangeData, currentPassword: e.target.value })}
          required
        />
        <Input
          type="password"
          placeholder="New Password"
          value={passwordChangeData.newPassword}
          onChange={(e) => setPasswordChangeData({ ...passwordChangeData, newPassword: e.target.value })}
          required
        />
        <Input
          type="password"
          placeholder="Confirm New Password"
          value={passwordChangeData.confirmNewPassword}
          onChange={(e) => setPasswordChangeData({ ...passwordChangeData, confirmNewPassword: e.target.value })}
          required
        />
        <Button type="submit">Change Password</Button>
      </PasswordChangeForm>
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