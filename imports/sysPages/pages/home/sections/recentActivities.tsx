import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { useNavigate } from 'react-router-dom';
import { 
	Typography, 
	Card, 
	CardContent, 
	Button, 
	Box, 
	List, 
	ListItem, 
	ListItemText,
	Chip,
	Divider 
} from '@mui/material';
import { getUser } from '/imports/libs/getUser';
import { toDosApi } from '/imports/modules/toDos/api/toDosApi';
import { IToDos } from '/imports/modules/toDos/api/toDosSch';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const RecentActivities: React.FC = () => {
	const navigate = useNavigate();
	const user = getUser();

	const { recentToDos, loading } = useTracker(() => {
		const userId = user?._id;
		if (!userId) {
			return { recentToDos: [], loading: false };
		}
		
		const filter = { createdby: userId };
		const subHandle = toDosApi.subscribe('recentToDos', filter);
		const recentToDos = subHandle?.ready() ? toDosApi.find(filter, {
			sort: { lastupdate: -1, createdat: -1 },
			limit: 5
		}).fetch() : [];

		return {
			recentToDos,
			loading: !!subHandle && !subHandle.ready()
		};
	}, [user]);

	const handleGoToTasks = () => {
		navigate('/toDos');
	};

	const getStatusLabel = (todo: IToDos) => {
		return todo.completed ? 'Concluída' : 'Pendente';
	};

	const getStatusColor = (todo: IToDos) => {
		return todo.completed ? 'success' : 'warning';
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'alta': return 'error';
			case 'media': return 'warning';
			case 'baixa': return 'info';
			default: return 'default';
		}
	};

	if (loading) {
		return (
			<Card sx={{ mt: 3 }}>
				<CardContent>
					<Typography>Carregando atividades recentes...</Typography>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card sx={{ mt: 3 }}>
			<CardContent>
				<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
					<Typography variant="h5" component="h2">
						Atividades Recentes
					</Typography>
					<Button 
						variant="contained" 
						color="primary" 
						onClick={handleGoToTasks}
					>
						Minhas Tarefas
					</Button>
				</Box>

				{recentToDos.length === 0 ? (
					<Typography color="textSecondary">
						Nenhuma tarefa encontrada. Comece criando sua primeira tarefa!
					</Typography>
				) : (
					<List>
						{recentToDos.map((todo, index) => (
							<React.Fragment key={todo._id}>
								<ListItem alignItems="flex-start">
									<ListItemText
										primary={
											<Box display="flex" alignItems="center" gap={1}>
												<Typography variant="subtitle1" component="span">
													{todo.title}
												</Typography>
												<Chip 
													size="small" 
													label={getStatusLabel(todo)} 
													color={getStatusColor(todo)}
												/>
												{todo.priority && (
													<Chip 
														size="small" 
														label={`Prioridade: ${todo.priority}`} 
														color={getPriorityColor(todo.priority)}
														variant="outlined"
													/>
												)}
											</Box>
										}
										secondary={
											<Box>
												{todo.description && (
													<Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
														{todo.description}
													</Typography>
												)}
												<Typography variant="caption" color="textSecondary">
													Atualizada em: {format(new Date(todo.lastupdate || todo.createdat), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
												</Typography>
											</Box>
										}
									/>
								</ListItem>
								{index < recentToDos.length - 1 && <Divider />}
							</React.Fragment>
						))}
					</List>
				)}
			</CardContent>
		</Card>
	);
};

export default RecentActivities; 