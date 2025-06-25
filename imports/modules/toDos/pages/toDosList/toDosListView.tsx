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
	Checkbox
} from '@mui/material';
import { IToDos } from '../../api/toDosSch';

const ToDosListView = () => {
	const controller = React.useContext(ToDosListControllerContext);
	
	const {
		Container,
		LoadingContainer,
		SearchContainer
	} = ToDosListStyles;

	const options = [{ value: '', label: 'Todas as categorias' }, ...(controller.schema.category?.options?.() ?? [])];

	return (
		<Container>
			<Typography variant="h5">Lista de Tarefas</Typography>
			<SearchContainer>
				<SysTextField
					name="search"
					placeholder="Pesquisar por título"
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
											cursor: 'pointer',
											'&:hover': {
												backgroundColor: 'action.hover'
											},
											opacity: task.completed ? 0.7 : 1
										}}
										onClick={() => controller.handleTaskClick(task)}
									>
										<Checkbox
											checked={task.completed}
											onChange={(e) => {
												e.stopPropagation();
												controller.handleToggleComplete(task);
											}}
											color="success"
											sx={{ mr: 1 }}
										/>
										<ListItemAvatar>
											<Avatar 
												sx={{ 
													bgcolor: task.completed 
														? '#9e9e9e' 
														: controller.getPriorityColor(task.priority),
													color: 'white'
												}}
											>
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
														}}
													>
														{task.title}
													</Typography>
													<Chip 
														size="small" 
														label={`${task.priority?.charAt(0).toUpperCase()}${task.priority?.slice(1)}`}
														sx={{ 
															bgcolor: task.completed 
																? '#9e9e9e' 
																: controller.getPriorityColor(task.priority),
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
														}}
													>
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
												{task.completed && (
													<SysIcon 
														name="task" 
														sx={{ color: 'success.main', fontSize: 20 }} 
													/>
												)}
												<IconButton 
													edge="end" 
													aria-label="more"
													onClick={(e) => controller.handleMenuClick(e, task)}
												>
													<SysIcon name="moreVert" />
												</IconButton>
											</Box>
										</ListItemSecondaryAction>
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

			<Menu
				anchorEl={controller.anchorEl}
				open={Boolean(controller.anchorEl)}
				onClose={controller.handleMenuClose}
			>
				<MenuItem onClick={controller.handleEdit}>
					<SysIcon name="edit" sx={{ mr: 1 }} />
					Editar
				</MenuItem>
				<MenuItem onClick={controller.handleDelete}>
					<SysIcon name="delete" sx={{ mr: 1 }} />
					Excluir
				</MenuItem>
			</Menu>

			<SysFab
				variant="extended"
				text="Nova Tarefa"
				startIcon={<SysIcon name={'add'} />}
				fixed={true}
				onClick={controller.onAddButtonClick}
			/>
		</Container>
	);
};

export default ToDosListView;
