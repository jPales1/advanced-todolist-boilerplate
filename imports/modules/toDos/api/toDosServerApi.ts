// region Imports
import { Recurso } from '../config/recursos';
import { toDosSch, IToDos } from './toDosSch';
import { userprofileServerApi } from '/imports/modules/userprofile/api/userProfileServerApi';
import { ProductServerBase } from '/imports/api/productServerBase';

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
			(filter = {}) => {
				return this.defaultListCollectionPublication(filter, {
					projection: { title: 1, priority: 1, category: 1, completed: 1, createdat: 1 }
				});
			},
			(doc: IToDos & { nomeUsuario: string }) => {
				const userProfileDoc = userprofileServerApi.getCollectionInstance().findOneAsync({ _id: doc.createdby });
				return { ...doc };
			}
		);

		this.addPublication('toDosDetail', (filter = {}) => {
			return this.defaultDetailCollectionPublication(filter, {
				projection: {
					title: 1,
					description: 1,
					priority: 1,
					category: 1,
					dueDate: 1,
					completed: 1,
					notes: 1,
					attachments: 1
				}
			});
		});

		// Nova publicação para buscar as últimas 5 tarefas do usuário
		this.addPublication('recentToDos', (filter = {}) => {
			return this.defaultCollectionPublication(filter, {
				projection: { 
					title: 1, 
					description: 1, 
					completed: 1, 
					priority: 1,
					category: 1,
					dueDate: 1,
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
}

export const toDosServerApi = new ToDosServerApi();
