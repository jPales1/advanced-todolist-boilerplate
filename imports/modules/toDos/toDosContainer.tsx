import React from 'react';
import { IDefaultContainerProps } from '/imports/typings/BoilerplateDefaultTypings';
import { useParams } from 'react-router-dom';
import ToDosListController from '/imports/modules/toDos/pages/toDosList/toDosListController';
import ToDosDetailController from '/imports/modules/toDos/pages/toDosDetail/toDosDetailContoller';

export interface IToDosModuleContext {
	state?: string;
	id?: string;
}

export const ToDosModuleContext = React.createContext<IToDosModuleContext>({});

export default (props: IDefaultContainerProps) => {
	let { screenState, toDosId } = useParams();
	const state = screenState ?? props.screenState;
	const id = toDosId ?? props.id;

	const validState = ['view', 'edit', 'create'];

	const renderPage = () => {
		if (!state || !validState.includes(state)) return <ToDosListController />;
		return <ToDosDetailController />;
	};

	const providerValue = {
		state,
		id
	};
	return <ToDosModuleContext.Provider value={providerValue}>{renderPage()}</ToDosModuleContext.Provider>;
};
