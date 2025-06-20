import { IDoc } from '/imports/typings/IDoc';
import { ISchema } from '/imports/typings/ISchema';

export const toDosSch: ISchema<IToDos> = {
	title: {
		type: String,
		label: 'Título da Tarefa',
		defaultValue: '',
		optional: false
	},
	description: {
		type: String,
		label: 'Descrição',
		defaultValue: '',
		optional: true
	},
	priority: {
		type: String,
		label: 'Prioridade',
		optional: false,
		defaultValue: 'media',
		options: () => [
			{ value: 'alta', label: 'Alta' },
			{ value: 'media', label: 'Média' },
			{ value: 'baixa', label: 'Baixa' }
		]
	},
	category: {
		type: String,
		label: 'Categoria',
		defaultValue: '',
		optional: true,
		options: () => [
			{ value: 'trabalho', label: 'Trabalho' },
			{ value: 'pessoal', label: 'Pessoal' },
			{ value: 'estudo', label: 'Estudo' },
			{ value: 'saude', label: 'Saúde' },
			{ value: 'financeiro', label: 'Financeiro' }
		]
	},
	dueDate: {
		type: Date,
		label: 'Data de Vencimento',
		defaultValue: '',
		optional: true
	},
	completed: {
		type: Boolean,
		label: 'Concluída',
		defaultValue: false,
		optional: true
	},
	tags: {
		type: Array<String>,
		label: 'Tags',
		defaultValue: '',
		optional: true
	},
	notes: {
		type: String,
		label: 'Observações',
		defaultValue: '',
		optional: true
	},
	attachments: {
		type: [Object],
		label: 'Anexos',
		defaultValue: '',
		optional: true,
		isUpload: true
	}
};

export interface IToDos extends IDoc {
	title: string;
	description: string;
	priority: string;
	category: string;
	dueDate: Date;
	completed: boolean;
	tags: string[];
	notes: string;
	attachments: object[];
}