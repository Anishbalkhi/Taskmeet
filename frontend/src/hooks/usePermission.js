import { useRole } from "../context/RoleContext";


const usePermission = (permission) => {
  const { can } = useRole();
  return can(permission);
};

export default usePermission;
