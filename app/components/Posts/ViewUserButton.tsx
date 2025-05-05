"use client";

interface ViewUserButtonProps {
  userID: number;
}

const ViewUserButton: React.FC<ViewUserButtonProps> = ({userID}) => {
  const handleClick = () => alert(`User ID: ${userID}`);

  return (
    <>
      <button onClick={handleClick}>Lihat User</button>
    </>
  );
};

export default ViewUserButton;
