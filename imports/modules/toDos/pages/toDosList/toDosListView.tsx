import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { SysFab } from '/imports/ui/components/sysFab/sysFab';
import { ToDosListControllerContext } from './toDosListController';
import ToDosListStyles from './toDosListStyles';
import SysTextField from '/imports/ui/components/sysFormFields/sysTextField/sysTextField';
import { SysSelectField } from '/imports/ui/components/sysFormFields/sysSelectField/sysSelectField';
import SysIcon from '/imports/ui/components/sysIcon/sysIcon';
import {
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	ListItemSecondaryAction,
	Avatar,
	IconButton,
	Chip,
	Menu,
	MenuItem,
	Divider,
	Checkbox,
	Drawer,
	Button
} from '@mui/material';
import { IToDos } from '../../api/toDosSch';

const ToDosListView = () => {
	const controller = React.useContext(ToDosListControllerContext);

	const {
		Container,
		LoadingContainer,
		SearchContainer,
		DrawerContainer,
		DrawerHeader,
		DrawerContent,
		DrawerFooter,
		DrawerInfoSection
	} = ToDosListStyles;

	const options = [{ value: '', label: 'Todas as categorias' }, ...(controller.schema.category?.options?.() ?? [])];

	return (
		<Container>
			<Typography variant="h5">Lista de Tarefas</Typography>
			<SearchContainer>
				<SysTextField
					name="search"
					placeholder="Pesquisar"
					onChange={controller.onChangeTextField}
					startAdornment={<SysIcon name={'search'} />}
				/>
				<SysSelectField
					name="Category"
					label="Categoria"
					options={options}
					placeholder="Selecionar categoria"
					onChange={controller.onChangeCategory}
				/>
			</SearchContainer>

			{controller.loading ? (
				<LoadingContainer>
					<CircularProgress />
					<Typography variant="body1">Aguarde, carregando informações...</Typography>
				</LoadingContainer>
			) : (
				<Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
					{controller.todoList && controller.todoList.length > 0 ? (
						<List>
							{controller.todoList.map((task: IToDos & { nomeUsuario?: string }, index: number) => (
								<React.Fragment key={task._id}>
									<ListItem
										sx={{
											opacity: task.completed ? 0.7 : 1,
											padding: 0
										}}>
										<Checkbox
											checked={task.completed}
											onChange={() => controller.handleToggleComplete(task)}
											color="success"
											sx={{ mr: 1, ml: 2 }}
											disabled={!controller.canEditTask(task)}
											title={!controller.canEditTask(task) ? 'Você só pode alterar o status de suas próprias tarefas' : undefined}
										/>
										<Box
											sx={{
												flex: 1,
												cursor: 'pointer',
												'&:hover': {
													backgroundColor: 'action.hover'
												},
												display: 'flex',
												alignItems: 'center',
												pr: 2,
												py: 1
											}}
											onClick={() => controller.handleTaskClick(task)}>
											<ListItemAvatar>
												<Avatar
													sx={{
														bgcolor: task.completed ? '#9e9e9e' : controller.getPriorityColor(task.priority),
														color: 'white'
													}}>
													<SysIcon name={controller.getCategoryIcon(task.category)} />
												</Avatar>
											</ListItemAvatar>
											<ListItemText
												primary={
													<Box display="flex" alignItems="center" gap={1}>
														<Typography
															variant="subtitle1"
															component="span"
															sx={{
																textDecoration: task.completed ? 'line-through' : 'none',
																color: task.completed ? 'text.disabled' : 'text.primary'
															}}>
															{task.title}
														</Typography>
														<Chip
															size="small"
															label={`${task.priority?.charAt(0).toUpperCase()}${task.priority?.slice(1)}`}
															sx={{
																bgcolor: task.completed ? '#9e9e9e' : controller.getPriorityColor(task.priority),
																color: 'white'
															}}
														/>
														<Chip
															size="small"
															label={task.completed ? 'Concluída' : 'Pendente'}
															color={task.completed ? 'success' : 'warning'}
															variant={task.completed ? 'filled' : 'outlined'}
														/>
													</Box>
												}
												secondary={
													<Box>
														<Typography
															variant="body2"
															color={task.completed ? 'text.disabled' : 'textSecondary'}
															sx={{
																textDecoration: task.completed ? 'line-through' : 'none'
															}}>
															{task.description || 'Sem descrição'}
														</Typography>
														<Typography variant="caption" color="textSecondary">
															Criado por: {task.nomeUsuario || 'Usuário Desconhecido'}
														</Typography>
													</Box>
												}
											/>
											<ListItemSecondaryAction>
												<Box display="flex" alignItems="center" gap={1}>
													{task.completed && <SysIcon name="task" sx={{ color: 'success.main', fontSize: 20 }} />}
													{(controller.canEditTask(task) || controller.canDeleteTask(task)) && (
														<IconButton edge="end" aria-label="more" onClick={(e) => controller.handleMenuClick(e, task)}>
															<SysIcon name="moreVert" />
														</IconButton>
													)}
												</Box>
											</ListItemSecondaryAction>
										</Box>
									</ListItem>
									{index < controller.todoList.length - 1 && <Divider />}
								</React.Fragment>
							))}
						</List>
					) : (
						<Box textAlign="center" py={4}>
							<Typography variant="body1" color="textSecondary">
								Nenhuma tarefa encontrada.
							</Typography>
						</Box>
					)}
				</Box>
			)}

			<Menu anchorEl={controller.anchorEl} open={Boolean(controller.anchorEl)} onClose={controller.handleMenuClose}>
				{controller.selectedTask && controller.canEditTask(controller.selectedTask) && (
					<MenuItem onClick={() => controller.handleEdit()}>
						<SysIcon name="edit" sx={{ mr: 1 }} />
						Editar
					</MenuItem>
				)}
				{controller.selectedTask && controller.canDeleteTask(controller.selectedTask) && (
					<MenuItem onClick={controller.handleDelete}>
						<SysIcon name="delete" sx={{ mr: 1 }} />
						Excluir
					</MenuItem>
				)}
			</Menu>

			<SysFab
				variant="extended"
				text="Nova Tarefa"
				startIcon={<SysIcon name={'add'} />}
				fixed={true}
				onClick={controller.onAddButtonClick}
			/>

			{/* Drawer de Visualização da Tarefa */}
			<Drawer
				anchor="right"
				open={controller.viewModalOpen}
				onClose={controller.handleCloseModal}
				sx={{
					'& .MuiDrawer-paper': {
						width: { xs: '100%', sm: 400, md: 500 },
						boxSizing: 'border-box'
					}
				}}>
				{controller.viewingTask && (
					<DrawerContainer>
						{/* Header */}
						<DrawerHeader>
							<Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
								<Typography variant="h6" component="div">
									Detalhes da Tarefa
								</Typography>
								<IconButton onClick={controller.handleCloseModal} edge="end">
									<SysIcon name="close" />
								</IconButton>
							</Box>

							<Box display="flex" alignItems="center" gap={2} mb={2}>
								<Avatar
									sx={{
										bgcolor: controller.viewingTask.completed
											? '#9e9e9e'
											: controller.getPriorityColor(controller.viewingTask.priority),
										color: 'white',
										width: 48,
										height: 48
									}}>
									<SysIcon name={controller.getCategoryIcon(controller.viewingTask.category)} />
								</Avatar>
								<Box flex={1}>
									<Typography
										variant="h5"
										component="div"
										sx={{
											textDecoration: controller.viewingTask.completed ? 'line-through' : 'none',
											color: controller.viewingTask.completed ? 'text.disabled' : 'text.primary'
										}}>
										{controller.viewingTask.title}
									</Typography>
								</Box>
							</Box>

							<Box display="flex" gap={1} flexWrap="wrap">
								<Chip
									size="small"
									label={controller.viewingTask.completed ? 'Concluída' : 'Pendente'}
									color={controller.viewingTask.completed ? 'success' : 'warning'}
									variant={controller.viewingTask.completed ? 'filled' : 'outlined'}
								/>
								<Chip
									size="small"
									label={`Prioridade ${controller.viewingTask.priority?.charAt(0).toUpperCase()}${controller.viewingTask.priority?.slice(1)}`}
									sx={{
										bgcolor: controller.viewingTask.completed
											? '#9e9e9e'
											: controller.getPriorityColor(controller.viewingTask.priority),
										color: 'white'
									}}
								/>
							</Box>
						</DrawerHeader>

						{/* Content */}
						<DrawerContent>
							<DrawerInfoSection>
								<Typography variant="subtitle2" color="textSecondary" gutterBottom>
									Descrição
								</Typography>
								<Typography
									variant="body1"
									sx={{
										textDecoration: controller.viewingTask.completed ? 'line-through' : 'none',
										color: controller.viewingTask.completed ? 'text.disabled' : 'text.primary'
									}}>
									{controller.viewingTask.description || 'Sem descrição'}
								</Typography>
							</DrawerInfoSection>

							<DrawerInfoSection>
								<Typography variant="subtitle2" color="textSecondary" gutterBottom>
									Categoria
								</Typography>
								<Box display="flex" alignItems="center" gap={1}>
									<SysIcon name={controller.getCategoryIcon(controller.viewingTask.category)} />
									<Typography variant="body1">
										{controller.viewingTask.category?.charAt(0).toUpperCase()}
										{controller.viewingTask.category?.slice(1)}
									</Typography>
								</Box>
							</DrawerInfoSection>

							{controller.viewingTask.dueDate && (
								<DrawerInfoSection>
									<Typography variant="subtitle2" color="textSecondary" gutterBottom>
										Data de Vencimento
									</Typography>
									<Typography variant="body1">
										{new Date(controller.viewingTask.dueDate).toLocaleDateString('pt-BR')}
									</Typography>
								</DrawerInfoSection>
							)}

							{controller.viewingTask.notes && (
								<DrawerInfoSection>
									<Typography variant="subtitle2" color="textSecondary" gutterBottom>
										Observações
									</Typography>
									<Typography variant="body1">{controller.viewingTask.notes}</Typography>
								</DrawerInfoSection>
							)}

							<DrawerInfoSection>
								<Typography variant="subtitle2" color="textSecondary" gutterBottom>
									Criado em
								</Typography>
								<Typography variant="body1">
									{controller.viewingTask.createdat
										? new Date(controller.viewingTask.createdat).toLocaleDateString('pt-BR')
										: 'Data não disponível'}{' '}
									às{' '}
									{controller.viewingTask.createdat
										? new Date(controller.viewingTask.createdat).toLocaleTimeString('pt-BR', {
												hour: '2-digit',
												minute: '2-digit'
											})
										: ''}
								</Typography>
							</DrawerInfoSection>
						</DrawerContent>

						{/* Footer Actions com verificação de permissões */}
						<DrawerFooter>
							<Box display="flex" gap={1} flexDirection="column">
								{controller.canEditTask(controller.viewingTask) && (
									<Button
										onClick={() => {
											if (controller.viewingTask) {
												controller.handleCloseModal();
												controller.handleEdit(controller.viewingTask);
											}
										}}
										color="primary"
										variant="contained"
										fullWidth
										startIcon={<SysIcon name="edit" />}>
										Editar Tarefa
									</Button>
								)}
								<Button onClick={controller.handleCloseModal} color="inherit" fullWidth>
									Fechar
								</Button>
							</Box>
						</DrawerFooter>
					</DrawerContainer>
				)}
			</Drawer>
		</Container>
	);
};

export default ToDosListView;
