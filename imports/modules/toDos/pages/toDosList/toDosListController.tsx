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
import { getUser } from '/imports/libs/getUser';

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
	handleEdit: (task?: IToDos) => void;
	handleDelete: () => void;
	handleTaskClick: (task: IToDos) => void;
	handleToggleComplete: (task: IToDos) => void;
	handleCloseModal: () => void;
	anchorEl: HTMLElement | null;
	selectedTask: IToDos | null;
	viewModalOpen: boolean;
	viewingTask: IToDos | null;
	canEditTask: (task: IToDos) => boolean;
	canDeleteTask: (task: IToDos) => boolean;
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
	const [viewModalOpen, setViewModalOpen] = React.useState<boolean>(false);
	const [viewingTask, setViewingTask] = React.useState<IToDos | null>(null);
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

	const currentUser = getUser();

	const canEditTask = useCallback((task: IToDos) => {
		return currentUser && task.createdby === currentUser._id;
	}, [currentUser]);

	const canDeleteTask = useCallback((task: IToDos) => {
		return currentUser && task.createdby === currentUser._id;
	}, [currentUser]);

	const handleEdit = useCallback((task?: IToDos) => {
		const taskToEdit = task || selectedTask;
		if (taskToEdit) {
			if (!canEditTask(taskToEdit)) {
				showNotification({
					type: 'warning',
					message: 'Você só pode editar tarefas criadas por você'
				});
				return;
			}
			navigate('/toDos/edit/' + taskToEdit._id);
		}
		if (!task) {
			handleMenuClose();
		}
	}, [selectedTask, navigate, handleMenuClose, canEditTask, showNotification]);

	const handleDelete = useCallback(() => {
		if (selectedTask) {
			if (!canDeleteTask(selectedTask)) {
				showNotification({
					type: 'warning',
					message: 'Você só pode excluir tarefas criadas por você'
				});
				handleMenuClose();
				return;
			}

			DeleteDialog({
				showDialog,
				closeDialog,
				title: `Excluir tarefa ${selectedTask.title}`,
				message: `Tem certeza que deseja excluir a tarefa "${selectedTask.title}"?`,
				onDeleteConfirm: () => {
					toDosApi.remove(selectedTask, (e: any, result: any) => {
						if (!e) {
							showNotification({
								type: 'success',
								message: result?.message || 'Tarefa excluída com sucesso!'
							});
						} else {
							showNotification({
								type: 'error',
								message: e.message || e.reason || 'Erro ao excluir tarefa'
							});
						}
					});
				}
			});
		}
		handleMenuClose();
	}, [selectedTask, showDialog, closeDialog, showNotification, handleMenuClose, canDeleteTask]);

	const handleTaskClick = useCallback((task: IToDos) => {
		setViewingTask(task);
		setViewModalOpen(true);
	}, []);

	const handleCloseModal = useCallback(() => {
		setViewModalOpen(false);
		setViewingTask(null);
	}, []);

	const handleToggleComplete = useCallback((task: IToDos) => {
		const updatedTask = { ...task, completed: !task.completed };
		toDosApi.update(updatedTask, (e: any, result: any) => {
			if (!e) {
				showNotification({
					type: 'success',
					message: result?.message || `Tarefa ${updatedTask.completed ? 'concluída' : 'reaberta'} com sucesso!`
				});
			} else {
				showNotification({
					type: 'error',
					message: e.message || e.reason || 'Erro ao atualizar status da tarefa'
				});
			}
		});
	}, [showNotification]);

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
			handleCloseModal,
			anchorEl,
			selectedTask,
			viewModalOpen,
			viewingTask,
			canEditTask,
			canDeleteTask
		}),
		[toDoss, loading, getCategoryIcon, getPriorityColor, handleMenuClick, handleMenuClose, handleEdit, handleDelete, handleTaskClick, handleToggleComplete, handleCloseModal, anchorEl, selectedTask, viewModalOpen, viewingTask, showNotification, canEditTask, canDeleteTask]
	);

	return (
		<ToDosListControllerContext.Provider value={providerValues}>
			<ToDosListView />
		</ToDosListControllerContext.Provider>
	);
};

export default ToDosListController;
