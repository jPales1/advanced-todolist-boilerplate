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
	const userId = user?._id;

	const { recentToDos, loading } = useTracker(() => {
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
	}, [userId]);

	const handleGoToTasks = () => {
		navigate('/toDos');
	};

	const handleCreateSampleTasks = () => {
		Meteor.call('fixtures.createSampleTasks', (error: any, result: string) => {
			if (error) {
				console.error('Erro ao criar tarefas de exemplo:', error);
			} else {
				console.log(result);
			}
		});
	};

	const getStatusLabel = (todo: IToDos) => {
		return todo.completed ? 'Concluída' : 'Pendente';
	};

	const getStatusColor = (todo: IToDos): "success" | "warning" => {
		return todo.completed ? 'success' : 'warning';
	};

	const getPriorityColor = (priority: string): "error" | "warning" | "info" | "default" => {
		switch (priority) {
			case 'alta': return 'error';
			case 'media': return 'warning';
			case 'baixa': return 'info';
			default: return 'default';
		}
	};

	console.log('RecentActivities render - loading:', loading, 'tasks:', recentToDos.length);

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
					<Box textAlign="center" py={3}>
						<Typography color="textSecondary" paragraph>
							Nenhuma tarefa encontrada. Comece criando sua primeira tarefa!
						</Typography>
						<Box display="flex" gap={2} justifyContent="center">
							<Button 
								variant="outlined" 
								color="secondary" 
								onClick={handleCreateSampleTasks}
							>
								Criar Tarefas de Exemplo
							</Button>
							<Button 
								variant="contained" 
								color="primary" 
								onClick={handleGoToTasks}
							>
								Criar Nova Tarefa
							</Button>
						</Box>
					</Box>
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