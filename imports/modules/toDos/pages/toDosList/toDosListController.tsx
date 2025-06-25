import React, { useCallback, useMemo, useContext } from 'react';
import ToDosListView from './toDosListView';
import { nanoid } from 'nanoid';
import { useNavigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { ISchema } from '/imports/typings/ISchema';
import { IToDos } from '../../api/toDosSch';
import { toDosApi } from '../../api/toDosApi';
import AppLayoutContext, { IAppLayoutContext } from '/imports/app/appLayoutProvider/appLayoutContext';
import DeleteDialog from '/imports/ui/appComponents/showDialog/custom/deleteDialog/deleteDialog';

interface IInitialConfig {
	sortProperties: { field: string; sortAscending: boolean };
	filter: Object;
	searchBy: string | null;
	viewComplexTable: boolean;
}

interface IToDosListContollerContext {
	onAddButtonClick: () => void;
	onDeleteButtonClick: (row: any) => void;
	todoList: IToDos[];
	schema: ISchema<any>;
	loading: boolean;
	onChangeTextField: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onChangeCategory: (event: React.ChangeEvent<HTMLInputElement>) => void;
	getCategoryIcon: (category: string) => "domain" | "person" | "science" | "favorite" | "shoppingCart" | "task";
	getPriorityColor: (priority: string) => string;
	handleMenuClick: (event: React.MouseEvent<HTMLElement>, task: IToDos) => void;
	handleMenuClose: () => void;
	handleEdit: () => void;
	handleDelete: () => void;
	handleTaskClick: (task: IToDos) => void;
	handleToggleComplete: (task: IToDos) => void;
	anchorEl: HTMLElement | null;
	selectedTask: IToDos | null;
}

export const ToDosListControllerContext = React.createContext<IToDosListContollerContext>(
	{} as IToDosListContollerContext
);

const initialConfig = {
	sortProperties: { field: 'createdat', sortAscending: true },
	filter: {},
	searchBy: null,
	viewComplexTable: false
};

const ToDosListController = () => {
	const [config, setConfig] = React.useState<IInitialConfig>(initialConfig);
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const [selectedTask, setSelectedTask] = React.useState<IToDos | null>(null);
	const { showDialog, closeDialog, showNotification } = useContext<IAppLayoutContext>(AppLayoutContext);

	const { title, description, priority, category } = toDosApi.getSchema();
	const toDosSchReduzido = { 
		title, 
		description,
		priority, 
		category, 
		completed: { type: Boolean, label: 'Status' },
		createdat: { type: Date, label: 'Criado em' } 
	};
	const navigate = useNavigate();

	const { sortProperties, filter } = config;
	const sort = {
		[sortProperties.field]: sortProperties.sortAscending ? 1 : -1
	};

	const { loading, toDoss } = useTracker(() => {
		const subHandle = toDosApi.subscribe('toDosList', filter, {
			sort
		});
		const toDoss = subHandle?.ready() ? toDosApi.find(filter, { sort }).fetch() : [];
		return {
			toDoss,
			loading: !!subHandle && !subHandle.ready(),
			total: subHandle ? subHandle.total : toDoss.length
		};
	}, [config]);

	const getCategoryIcon = useCallback((category: string): "domain" | "person" | "science" | "favorite" | "shoppingCart" | "task" => {
		switch (category) {
			case 'trabalho': return 'domain';
			case 'pessoal': return 'person';
			case 'estudo': return 'science';
			case 'saude': return 'favorite';
			case 'financeiro': return 'shoppingCart';
			default: return 'task';
		}
	}, []);

	const getPriorityColor = useCallback((priority: string) => {
		switch (priority) {
			case 'alta': return '#f44336'; // red
			case 'media': return '#ff9800'; // orange
			case 'baixa': return '#4caf50'; // green
			default: return '#9e9e9e'; // grey
		}
	}, []);

	const handleMenuClick = useCallback((event: React.MouseEvent<HTMLElement>, task: IToDos) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
		setSelectedTask(task);
	}, []);

	const handleMenuClose = useCallback(() => {
		setAnchorEl(null);
		setSelectedTask(null);
	}, []);

	const handleEdit = useCallback(() => {
		if (selectedTask) {
			navigate('/toDos/edit/' + selectedTask._id);
		}
		handleMenuClose();
	}, [selectedTask, navigate, handleMenuClose]);

	const handleDelete = useCallback(() => {
		if (selectedTask) {
			DeleteDialog({
				showDialog,
				closeDialog,
				title: `Excluir tarefa ${selectedTask.title}`,
				message: `Tem certeza que deseja excluir a tarefa "${selectedTask.title}"?`,
				onDeleteConfirm: () => {
					toDosApi.remove(selectedTask);
					showNotification({
						message: 'Tarefa excluída com sucesso!'
					});
				}
			});
		}
		handleMenuClose();
	}, [selectedTask, showDialog, closeDialog, showNotification, handleMenuClose]);

	const handleTaskClick = useCallback((task: IToDos) => {
		navigate('/toDos/view/' + task._id);
	}, [navigate]);

	const handleToggleComplete = useCallback((task: IToDos) => {
		const updatedTask = { ...task, completed: !task.completed };
		toDosApi.update(updatedTask, (e: any) => {
			if (e) {
				console.error('Erro ao atualizar tarefa:', e);
			}
		});
	}, []);

	const onAddButtonClick = useCallback(() => {
		const newDocumentId = nanoid();
		navigate(`/toDos/create/${newDocumentId}`);
	}, [navigate]);

	const onDeleteButtonClick = useCallback((row: any) => {
		toDosApi.remove(row);
	}, []);

	const onChangeTextField = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		const delayedSearch = setTimeout(() => {
			setConfig((prev) => ({
				...prev,
				filter: { ...prev.filter, title: { $regex: value.trim(), $options: 'i' } }
			}));
		}, 1000);
		return () => clearTimeout(delayedSearch);
	}, []);

	const onSelectedCategory = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		if (!value) {
			setConfig((prev) => ({
				...prev,
				filter: {
					...prev.filter,
					category: { $ne: null }
				}
			}));
			return;
		}
		setConfig((prev) => ({ ...prev, filter: { ...prev.filter, category: value } }));
	}, []);

	const providerValues: IToDosListContollerContext = useMemo(
		() => ({
			onAddButtonClick,
			onDeleteButtonClick,
			todoList: toDoss,
			schema: toDosSchReduzido,
			loading,
			onChangeTextField,
			onChangeCategory: onSelectedCategory,
			getCategoryIcon,
			getPriorityColor,
			handleMenuClick,
			handleMenuClose,
			handleEdit,
			handleDelete,
			handleTaskClick,
			handleToggleComplete,
			anchorEl,
			selectedTask
		}),
		[toDoss, loading, getCategoryIcon, getPriorityColor, handleMenuClick, handleMenuClose, handleEdit, handleDelete, handleTaskClick, handleToggleComplete, anchorEl, selectedTask]
	);

	return (
		<ToDosListControllerContext.Provider value={providerValues}>
			<ToDosListView />
		</ToDosListControllerContext.Provider>
	);
};

export default ToDosListController;
