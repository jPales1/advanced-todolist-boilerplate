import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { SysFab } from '/imports/ui/components/sysFab/sysFab';
import { ToDosListControllerContext } from './toDosListController';
import { useNavigate } from 'react-router-dom';
import { ComplexTable } from '/imports/ui/components/ComplexTable/ComplexTable';
import DeleteDialog from '/imports/ui/appComponents/showDialog/custom/deleteDialog/deleteDialog';
import AppLayoutContext, { IAppLayoutContext } from '/imports/app/appLayoutProvider/appLayoutContext';
import ToDosListStyles from './toDosListStyles';
import SysTextField from '/imports/ui/components/sysFormFields/sysTextField/sysTextField';
import { SysSelectField } from '/imports/ui/components/sysFormFields/sysSelectField/sysSelectField';
import SysIcon from '/imports/ui/components/sysIcon/sysIcon';


const ToDosListView = () => {
	const controller = React.useContext(ToDosListControllerContext);
	const sysLayoutContext = React.useContext<IAppLayoutContext>(AppLayoutContext);
	const navigate = useNavigate();
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
				<Box sx={{ width: '100%' }}>
					<ComplexTable
						data={controller.todoList}
						schema={controller.schema}
						onRowClick={(row) => navigate('/toDos/view/' + row.id)}
						searchPlaceholder={'Pesquisar tarefa'}
						onEdit={(row) => navigate('/toDos/edit/' + row._id)}
						onDelete={(row) => {
							DeleteDialog({
								showDialog: sysLayoutContext.showDialog,
								closeDialog: sysLayoutContext.closeDialog,
								title: `Excluir tarefa ${row.title}`,
								message: `Tem certeza que deseja excluir a tarefa "${row.title}"?`,
								onDeleteConfirm: () => {
									controller.onDeleteButtonClick(row);
									sysLayoutContext.showNotification({
										message: 'Tarefa excluída com sucesso!'
									});
								}
							});
						}}
					/>
				</Box>
			)}

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
