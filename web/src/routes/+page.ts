import { PUBLIC_API_BASE_URL } from '$env/static/public';
import type { PageLoad } from './$types';
import type { User } from '$lib/types';

export const load: PageLoad = async ({ fetch, url }) => {
	let user: User | null = null;
	const code = url.searchParams.get('code');

	if (code) {
		try {
			await fetch(`${PUBLIC_API_BASE_URL}/auth/discord/callback?code=${code}`, {
				method: 'GET',
				credentials: 'include'
			});
		} catch (error) {
			console.error('Error fetching callback:', error);
		}
	}

	try {
		const response = await fetch(`${PUBLIC_API_BASE_URL}/member/`, {
			method: 'GET',
			credentials: 'include'
		});
		
		if (response.ok) {
			let callbackResponse = await response.json();
			user = {
				userId: callbackResponse.id,
				username: callbackResponse.name,
				roles: callbackResponse.roles.split(','),
				admin: callbackResponse.admin,
				manager: callbackResponse.manager,
				member: callbackResponse.member
			};
		}
	} catch (error) {
		console.error('Error getting current user:', error);
	}

	return {
		user
	};
};
