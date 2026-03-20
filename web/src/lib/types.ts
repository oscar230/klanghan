export interface User {
	userId: string;
	username: string;
	roles: string[];
	admin: boolean;
	manager: boolean;
	member: boolean;
}
