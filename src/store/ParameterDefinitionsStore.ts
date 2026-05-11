import { makeAutoObservable } from 'mobx';
import { ParameterDefinition } from '@/types/parameterdefinition';
import { getParameterDefinitions } from '@/api/parameterdefinition/getParameterDefinitions';
import { getParameterDefinition } from '@/api/parameterdefinition/getParameterDefinition';

export class ParameterDefinitionsStore {
    parameterDefinitions: ParameterDefinition[] | undefined = undefined;
    parameterDefinitionsLoading = false;
    parameterDefinitionsError: string | null = null;
    private byPdId: Map<string, ParameterDefinition> = new Map();

    constructor() {
        makeAutoObservable(this);
    }

    loadParameterDefinitions = async (force = false) => {
        if (this.parameterDefinitions && !force) return;
        this.parameterDefinitionsError = null;
        try {
            this.parameterDefinitionsLoading = true;
            const pds = await getParameterDefinitions();
            this.parameterDefinitions = pds;
            this.byPdId = new Map(pds.map((pd) => [pd.pd_id, pd]));
        } catch (error) {
            this.parameterDefinitionsError = (error as Error).message;
        } finally {
            this.parameterDefinitionsLoading = false;
        }
    };

    /** Synchronous lookup. Returns undefined if the PD isn't cached. */
    getByPdId = (pdId: string): ParameterDefinition | undefined => this.byPdId.get(pdId);

    /** Cache-or-fetch: used by builders that open before the list-cache is warm. */
    ensurePdId = async (pdId: string): Promise<ParameterDefinition | undefined> => {
        const cached = this.byPdId.get(pdId);
        if (cached) return cached;
        try {
            const pd = await getParameterDefinition(pdId);
            this.byPdId.set(pd.pd_id, pd);
            return pd;
        } catch (error) {
            this.parameterDefinitionsError = (error as Error).message;
            return undefined;
        }
    };

    reset = () => {
        this.parameterDefinitions = undefined;
        this.parameterDefinitionsLoading = false;
        this.parameterDefinitionsError = null;
        this.byPdId = new Map();
    };
}
