import { toDosRouterList } from './toDosRouters';
import { toDosMenuItemList } from './toDosAppMenu';
import { IModuleHub } from '../../modulesTypings';

const ToDos: IModuleHub = {
	pagesRouterList: toDosRouterList,
	pagesMenuItemList: toDosMenuItemList
};

export default ToDos;
