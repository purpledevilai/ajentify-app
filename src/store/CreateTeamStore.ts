import { makeAutoObservable } from 'mobx';
import { scrapePage } from '@/api/scrapepage/scrapePage';
import { createTeam } from '@/api/createteam/createTeam';
import { getJob } from '@/api/job/getJob';
import { AgentsStore } from './AgentsStore';


export const teamMemberTemplates = [
    {
        id: "customer-support",
        name: "Customer Support",
    },
    {
        id: "sales-and-marketing",
        name: "Sales and Marketing",
    },
    {
        id: "digital-marketing",
        name: "Digital Marketing",
    },
    {
        id: "engineering-and-development",
        name: "Developer",
    },
];

export class CreateTeamStore {
    
    // Business information
    businessName: string = '';
    businessDescription: string = '';
    linkData: { link: string, data: string, placeholder: string }[] = [
        { link: '', data: '', placeholder: 'https://yourbusiness.com/landing-page' },
        { link: '', data: '', placeholder: 'https://yourbusiness.com/about-us' },
        { link: '', data: '', placeholder: 'https://yourbusiness.com/faqs' },
    ];
    
    // Team members to create
    selectedMembers: string[] = [];
    
    // UI State
    steps = ['business-information', 'select-members', 'creating-agents', 'success'];
    step: 'business-information' | 'select-members' | 'creating-agents' | 'success' = 'business-information';
    createingTeamLoading = false;
    gettingLinkData = false;

    // Job ID
    jobId: string = '';
    pollingTime: number = 2000;

    // Error fields
    getLinkDataError: string | null = null;
    submitCreateTeamError: string | null = null;
    pollJobStatusError: string | null = null;

    private readonly agentsRef: AgentsStore | undefined;
    
    constructor(agents?: AgentsStore) {
        this.agentsRef = agents;
        makeAutoObservable(this);
    }

    reset = () => {
        this.businessName = '';
        this.businessDescription = '';
        this.linkData = [
            { link: '', data: '', placeholder: 'https://yourbusiness.com/landing-page' },
            { link: '', data: '', placeholder: 'https://yourbusiness.com/about-us' },
            { link: '', data: '', placeholder: 'https://yourbusiness.com/faqs' },
        ];
        this.selectedMembers = [];
        this.step = 'business-information';
        this.createingTeamLoading = false;
        this.gettingLinkData = false;
        this.jobId = '';
        this.getLinkDataError = null;
        this.submitCreateTeamError = null;
        this.pollJobStatusError = null;
    }

    stepForward() {
        const currentIndex = this.steps.indexOf(this.step);
        if (currentIndex < this.steps.length - 1) {
            this.step = this.steps[currentIndex + 1] as 'business-information' | 'select-members' | 'creating-agents' | 'success';
        }
    }

    stepBack() {
        const currentIndex = this.steps.indexOf(this.step);
        if (currentIndex > 0) {
            this.step = this.steps[currentIndex - 1] as 'business-information' | 'select-members' | 'creating-agents' | 'success';
        }
    }

    setBusinessName(value: string) {
        this.businessName = value;
    }

    setBusinessDescription(value: string) {
        this.businessDescription = value;
    }

    setLink(index: number, value: string) {
        this.linkData[index].link = value;
    }

    addLink() {
        this.linkData.push({ link: '', data: '', placeholder: '' });
    }

    removeLink(index: number) {
        this.linkData.splice(index, 1);
    }

    toggleMember(memberId: string) {
        if (this.selectedMembers.includes(memberId)) {
            this.selectedMembers = this.selectedMembers.filter((id) => id !== memberId);
        } else {
            this.selectedMembers.push(memberId);
        }
    }

    async getLinkData() {
        this.getLinkDataError = null;
        this.gettingLinkData = true;
        try {
            this.linkData = await Promise.all(this.linkData.map(async (link) => {
                if (!link.link) {
                    return link;
                }
                return {
                    link: link.link,
                    data: await scrapePage(link.link),
                    placeholder: link.placeholder,
                }
            }));
        } catch (error) {
            console.error('Error getting link data:', error);
            this.getLinkDataError = (error as Error).message;
        } finally {
            this.gettingLinkData = false;
        }
    }

    async submitCreateTeam() {
        this.submitCreateTeamError = null;
        this.createingTeamLoading = true;
        try {
            const job = await createTeam({
                business_name: this.businessName,
                business_description: this.businessDescription,
                link_data: this.linkData.filter((link) => link.link), // Remove empty links
                selected_members: this.selectedMembers,
            });
            this.jobId = job.job_id;
            setTimeout(() => {
                console.log("Polling job status");
                this.pollJobStatus();
            }, this.pollingTime);
        } catch (error) {
            console.error('Error creating team:', error);
            this.submitCreateTeamError = (error as Error).message;
        } finally {
            this.createingTeamLoading = false;
        }
    }

    async pollJobStatus() {
        this.pollJobStatusError = null;
        this.createingTeamLoading = true;
        try {
            const job = await getJob(this.jobId);
            console.log("Job:", job);
            if (job.status === 'completed') {
                void this.agentsRef?.loadAgents(true);
                this.stepForward();
            } else if (job.status === 'error') {
                this.pollJobStatusError = job.message;
            } else {
                setTimeout(() => {
                    console.log("Polling job status repeate");
                    this.pollJobStatus();
                }, this.pollingTime);
            }
        } catch (error) {
            console.error('Error polling job status:', error);
            this.pollJobStatusError = (error as Error).message;
        } finally {
            this.createingTeamLoading = false;
        }
    };

}
