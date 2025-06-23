import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { userprofileServerApi } from '../modules/userprofile/api/userProfileServerApi';
import { toDosServerApi } from '../modules/toDos/api/toDosServerApi';

async function createDefautUser() {
	// if (Meteor.isDevelopment && Meteor.users.find().count() === 0) {
	const count = await Meteor.users.find({}).countAsync();
	if ((await Meteor.users.find({}).countAsync()) === 0) {
		let createdUserId = '';
		createdUserId = await Accounts.createUserAsync({
			username: 'Administrador',
			email: 'admin@mrb.com',
			password: 'admin@mrb.com'
		});


		await Meteor.users.upsertAsync(
			{ _id: createdUserId },
			{
				$set: {
					'emails.0.verified': true,
					profile: {
						name: 'Admin',
						email: 'admin@mrb.com'
					}
				}
			}
		);

		await userprofileServerApi.getCollectionInstance().insertAsync({
			_id: createdUserId,
			username: 'Administrador',
			email: 'admin@mrb.com',
			roles: ['Administrador']
		});

		return createdUserId;
	}
	return null;
}

async function createSampleTasks(userId: string) {
	const tasksCount = await toDosServerApi.getCollectionInstance().find({}).countAsync();
	
	if (tasksCount === 0) {
		console.log('Criando tarefas de exemplo...');
		
		const sampleTasks = [
			{
				title: 'Estudar React',
				description: 'Revisar conceitos de hooks e componentes funcionais',
				priority: 'alta',
				category: 'estudo',
				dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias a partir de hoje
				completed: false,
				notes: 'Focar em useState e useEffect',
				attachments: [],
				createdby: userId,
				createdat: new Date(),
				lastupdate: new Date()
			},
			{
				title: 'Fazer exercícios físicos',
				description: 'Ir à academia e fazer treino de pernas',
				priority: 'media',
				category: 'saude',
				dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Amanhã
				completed: false,
				notes: 'Lembrar de levar toalha',
				attachments: [],
				createdby: userId,
				createdat: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
				lastupdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
			}
		];

		for (const task of sampleTasks) {
			await toDosServerApi.getCollectionInstance().insertAsync(task);
		}
		
		console.log(`${sampleTasks.length} tarefas de exemplo criadas com sucesso!`);
	}
}

// if the database is empty on server start, create some sample data.
Meteor.startup(async () => {
	console.log('fixtures Meteor.startup');
	// Add default admin account
	const userId = await createDefautUser();
	
	// Se criou um usuário, criar tarefas de exemplo para ele
	if (userId) {
		await createSampleTasks(userId);
	} else {
		// Se já existe usuário, pegar o admin para criar tarefas se necessário
		const adminUser = await Meteor.users.findOneAsync({ 'emails.address': 'admin@mrb.com' });
		if (adminUser) {
			await createSampleTasks(adminUser._id);
		}
	}
});

// Métodos para gerenciar tarefas de exemplo
Meteor.methods({
	async 'fixtures.createSampleTasks'() {
		if (!this.userId) {
			throw new Meteor.Error('not-authorized', 'Usuário não autenticado');
		}
		
		const user = await Meteor.users.findOneAsync(this.userId);
		if (!user) {
			throw new Meteor.Error('user-not-found', 'Usuário não encontrado');
		}

		await createSampleTasks(this.userId);
		return 'Tarefas de exemplo criadas com sucesso!';
	},

	async 'fixtures.clearAndCreateSampleTasks'() {
		if (!this.userId) {
			throw new Meteor.Error('not-authorized', 'Usuário não autenticado');
		}

		// Remover todas as tarefas do usuário
		await toDosServerApi.getCollectionInstance().removeAsync({ createdby: this.userId });
		
		// Criar novas tarefas de exemplo
		await createSampleTasks(this.userId);
		return 'Tarefas anteriores removidas e novas tarefas de exemplo criadas!';
	}
});
