// region Imports
import { Recurso } from '../config/recursos';
import { toDosSch, IToDos } from './toDosSch';
import { userprofileServerApi } from '/imports/modules/userprofile/api/userProfileServerApi';
import { ProductServerBase } from '/imports/api/productServerBase';
import { IContext } from '/imports/typings/IContext';
import { getUserServer } from '/imports/modules/userprofile/api/userProfileServerApi';

// endregion

class ToDosServerApi extends ProductServerBase<IToDos> {
	constructor() {
		super('toDos', toDosSch, {
			resources: Recurso
			// saveImageToDisk: true,
		});

		const self = this;

		this.addTransformedPublication(
			'toDosList',
			async (filter = {}) => {
				const currentUser = await getUserServer();
				if (!currentUser) {
					throw new Meteor.Error('not-authorized', 'Usuário não autenticado');
				}

				const taskFilter = {
					...filter,
					$or: [
						{ isPersonal: { $ne: true } },
						{ $and: [{ isPersonal: true }, { createdby: currentUser._id }] }
					]
				};

				return this.defaultListCollectionPublication(taskFilter as any, {
					projection: { title: 1, description: 1, priority: 1, category: 1, completed: 1, isPersonal: 1, createdat: 1, createdby: 1 }
				});
			},
			async (doc: IToDos & { nomeUsuario: string }) => {
				const userProfileDoc = await userprofileServerApi.getCollectionInstance().findOneAsync({ _id: doc.createdby });
				return { 
					...doc, 
					nomeUsuario: userProfileDoc?.username || 'Usuário Desconhecido'
				};
			}
		);

		this.addPublication('toDosDetail', async (filter = {}) => {
			const currentUser = await getUserServer();
			if (!currentUser) {
				throw new Meteor.Error('not-authorized', 'Usuário não autenticado');
			}

			const taskFilter = {
				...filter,
				$or: [
					{ isPersonal: { $ne: true } },
					{ $and: [{ isPersonal: true }, { createdby: currentUser._id }] }
				]
			};

			return this.defaultDetailCollectionPublication(taskFilter as any, {
				projection: {
					title: 1,
					description: 1,
					priority: 1,
					category: 1,
					dueDate: 1,
					completed: 1,
					notes: 1,
					attachments: 1,
					isPersonal: 1,
					createdby: 1
				}
			});
		});

		// Nova publicação para buscar as últimas 5 tarefas do usuário
		this.addPublication('recentToDos', async (filter = {}) => {
			const currentUser = await getUserServer();
			if (!currentUser) {
				throw new Meteor.Error('not-authorized', 'Usuário não autenticado');
			}

			// Aplicar filtro de privacidade
			const taskFilter = {
				...filter,
				$or: [
					{ isPersonal: { $ne: true } }, // Tarefas não-pessoais
					{ $and: [{ isPersonal: true }, { createdby: currentUser._id }] } // Tarefas pessoais do usuário
				]
			};

			return this.defaultCollectionPublication(taskFilter as any, {
				projection: { 
					title: 1, 
					description: 1, 
					completed: 1, 
					priority: 1,
					category: 1,
					dueDate: 1,
					isPersonal: 1,
					createdat: 1,
					lastupdate: 1,
					createdby: 1
				},
				sort: { lastupdate: -1, createdat: -1 },
				limit: 5
			});
		});

		// this.addRestEndpoint(
		// 	'view',
		// 	(params, options) => {
		// 		console.log('Params', params);
		// 		console.log('options.headers', options.headers);
		// 		return { status: 'ok' };
		// 	},
		// 	['post']
		// );

		// this.addRestEndpoint(
		// 	'view/:toDosId',
		// 	(params, _options) => {
		// 		console.log('Rest', params);
		// 		if (params.toDosId) {
		// 			return self
		// 				.defaultCollectionPublication(
		// 					{
		// 						_id: params.toDosId
		// 					},
		// 					{}
		// 				)
		// 				.fetch();
		// 		} else {
		// 			return { ...params };
		// 		}
		// 	},
		// 	['get']
		// );
	}

	async beforeUpdate(docObj: IToDos | Partial<IToDos>, context: IContext) {
		const result = await super.beforeUpdate(docObj, context);
		
		const existingTask = await this.getCollectionInstance().findOneAsync({ _id: docObj._id });
		if (!existingTask) {
			throw new Meteor.Error('not-found', 'Tarefa não encontrada');
		}

		const currentUser = await getUserServer();
		if (!currentUser) {
			throw new Meteor.Error('not-authorized', 'Usuário não autenticado');
		}

		// Verificar se o usuário pode editar a tarefa
		if (existingTask.createdby !== currentUser._id) {
			throw new Meteor.Error('not-authorized', 'Você só pode editar tarefas criadas por você');
		}

		// Se a tarefa é pessoal, garantir que apenas o criador pode acessá-la
		if (existingTask.isPersonal && existingTask.createdby !== currentUser._id) {
			throw new Meteor.Error('not-authorized', 'Esta é uma tarefa pessoal de outro usuário');
		}

		return result;
	}

	async beforeRemove(docObj: IToDos | Partial<IToDos>, context: IContext) {
		const result = await super.beforeRemove(docObj, context);
		
		const existingTask = await this.getCollectionInstance().findOneAsync({ _id: docObj._id });
		if (!existingTask) {
			throw new Meteor.Error('not-found', 'Tarefa não encontrada');
		}

		const currentUser = await getUserServer();
		if (!currentUser) {
			throw new Meteor.Error('not-authorized', 'Usuário não autenticado');
		}

		// Verificar se o usuário pode remover a tarefa
		if (existingTask.createdby !== currentUser._id) {
			throw new Meteor.Error('not-authorized', 'Você só pode excluir tarefas criadas por você');
		}

		// Se a tarefa é pessoal, garantir que apenas o criador pode acessá-la
		if (existingTask.isPersonal && existingTask.createdby !== currentUser._id) {
			throw new Meteor.Error('not-authorized', 'Esta é uma tarefa pessoal de outro usuário');
		}

		return result;
	}

	// Métodos de sucesso
	async afterInsert(docObj: IToDos | Partial<IToDos>, context?: IContext) {
		const result = await super.afterInsert(docObj, context);
		return {
			...result,
			success: true,
			message: `Tarefa "${docObj.title}" criada com sucesso!`
		};
	}

	async afterUpdate(docObj: IToDos, context: IContext) {
		const result = await super.afterUpdate(docObj, context);
		return {
			...result,
			success: true,
			message: `Tarefa "${docObj.title}" atualizada com sucesso!`
		};
	}

	async afterRemove(docObj: IToDos | Partial<IToDos>, context: IContext) {
		const result = await super.afterRemove(docObj, context);
		return {
			...result,
			success: true,
			message: `Tarefa "${docObj.title}" excluída com sucesso!`
		};
	}

	// Métodos de erro
	onInsertError(doc: Partial<IToDos>, error: any): void {
		console.error('Erro ao inserir tarefa:', error);
		const customError = new Error(`Erro ao criar tarefa "${doc.title}": ${error.reason || error.message || 'Erro desconhecido'}`);
		throw customError;
	}

	onUpdateError(doc: Partial<IToDos>, error: any): void {
		console.error('Erro ao atualizar tarefa:', error);
		const customError = new Error(`Erro ao atualizar tarefa "${doc.title}": ${error.reason || error.message || 'Erro desconhecido'}`);
		throw customError;
	}

	onRemoveError(doc: Partial<IToDos>, error: any): void {
		console.error('Erro ao remover tarefa:', error);
		const customError = new Error(`Erro ao excluir tarefa "${doc.title}": ${error.reason || error.message || 'Erro desconhecido'}`);
		throw customError;
	}
}

export const toDosServerApi = new ToDosServerApi();
