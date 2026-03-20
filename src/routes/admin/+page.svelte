<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	
	let { data, form } = $props<{ data: PageData, form: any }>();
</script>

<div class="min-h-screen bg-gray-50 p-8">
	<div class="max-w-6xl mx-auto space-y-8">
		<header class="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
			<h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
			<div class="flex gap-4">
				<a href="/" class="text-blue-600 hover:text-blue-800 font-medium">View Public Schedule</a>
			</div>
		</header>
		
		{#if form?.error}
			<div class="bg-red-50 text-red-600 p-4 rounded-lg font-medium border border-red-200">
				{form.error}
			</div>
		{/if}

		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<!-- Users Panel -->
			<div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
				<div class="p-6 border-b border-gray-100 bg-gray-50/50">
					<h2 class="text-xl font-bold text-gray-900">Volunteers</h2>
				</div>
				<div class="p-6">
					<form method="POST" action="?/addUser" use:enhance class="flex gap-2 mb-6">
						<input type="text" name="name" placeholder="New Volunteer Name" required class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
						<button class="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">Add</button>
					</form>
					
					<div class="space-y-3 max-h-96 overflow-y-auto pr-2">
						{#each data.users as user}
							<div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
								<span class="font-medium text-gray-800">{user.name}</span>
								<form method="POST" action="?/deleteUser" use:enhance>
									<input type="hidden" name="id" value={user.id} />
									<button class="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1.5 hover:bg-red-50 rounded transition-colors">Remove</button>
								</form>
							</div>
						{/each}
						
						{#if data.users.length === 0}
							<p class="text-gray-500 text-center py-4">No volunteers found.</p>
						{/if}
					</div>
				</div>
			</div>
			
			<!-- Shifts Panel -->
			<div class="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
				<div class="p-6 border-b border-gray-100 bg-gray-50/50">
					<h2 class="text-xl font-bold text-gray-900">Schedule Management</h2>
				</div>
				<div class="p-6">
					<form method="POST" action="?/addShift" use:enhance class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8 bg-gray-50 p-5 rounded-xl border border-gray-100">
						<div class="col-span-2 lg:col-span-1">
							<label class="block text-xs font-semibold text-gray-600 uppercase mb-1.5" for="userId">Volunteer</label>
							<select name="userId" id="userId" required class="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
								<option value="">Select...</option>
								{#each data.users as user}
									<option value={user.id}>{user.name}</option>
								{/each}
							</select>
						</div>
						
						<div class="col-span-2 lg:col-span-1">
							<label class="block text-xs font-semibold text-gray-600 uppercase mb-1.5" for="role">Role</label>
							<input type="text" id="role" name="role" placeholder="e.g. Arbetsledare" required class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
						</div>
						
						<div class="col-span-1 lg:col-span-1">
							<label class="block text-xs font-semibold text-gray-600 uppercase mb-1.5" for="startTime">Start Time</label>
							<input type="datetime-local" id="startTime" name="startTime" required class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
						</div>
						
						<div class="col-span-1 lg:col-span-1">
							<label class="block text-xs font-semibold text-gray-600 uppercase mb-1.5" for="endTime">End Time</label>
							<input type="datetime-local" id="endTime" name="endTime" required class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
						</div>
						
						<div class="col-span-2 lg:col-span-1 flex items-end">
							<button class="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">Schedule</button>
						</div>
					</form>
					
					<div class="overflow-x-auto rounded-xl border border-gray-200">
						<table class="min-w-full text-left border-collapse">
							<thead class="bg-gray-50 border-b border-gray-200">
								<tr>
									<th class="px-5 py-3 text-sm font-semibold text-gray-700">Volunteer</th>
									<th class="px-5 py-3 text-sm font-semibold text-gray-700">Role</th>
									<th class="px-5 py-3 text-sm font-semibold text-gray-700">Start</th>
									<th class="px-5 py-3 text-sm font-semibold text-gray-700">End</th>
									<th class="px-5 py-3 text-sm font-semibold text-gray-700 text-right">Actions</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-100 bg-white">
								{#each data.shifts as shift}
									<tr class="hover:bg-gray-50/50 transition-colors">
										<td class="px-5 py-3.5 text-sm font-medium text-gray-900">
											{data.users.find(u => u.id === shift.userId)?.name || 'Unknown'}
										</td>
										<td class="px-5 py-3.5 text-sm text-gray-600">
											<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
												{shift.role}
											</span>
										</td>
										<td class="px-5 py-3.5 text-sm text-gray-500">{new Date(shift.startTime).toLocaleString('sv-SE', {dateStyle: 'short', timeStyle: 'short'})}</td>
										<td class="px-5 py-3.5 text-sm text-gray-500">{new Date(shift.endTime).toLocaleString('sv-SE', {dateStyle: 'short', timeStyle: 'short'})}</td>
										<td class="px-5 py-3.5 text-right">
											<form method="POST" action="?/deleteShift" use:enhance class="inline">
												<input type="hidden" name="id" value={shift.id} />
												<button class="text-xs font-medium text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition-colors">Delete</button>
											</form>
										</td>
									</tr>
								{/each}
								
								{#if data.shifts.length === 0}
									<tr>
										<td colspan="5" class="px-5 py-8 text-center text-gray-500">No shifts scheduled yet.</td>
									</tr>
								{/if}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
