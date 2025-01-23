import { makeAutoObservable } from 'mobx';
import { ShowAlertParams } from '@/app/components/AlertProvider';
import { scrapePage } from '@/api/scrapepage/scrapePage';
import { createTeam } from '@/api/createteam/createTeam';
import { getJob } from '@/api/job/getJob';
import { agentsStore } from './AgentsStore';
import { authStore } from './AuthStore';


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

class CreateTeamStore {
    
    // Business information
    businessName: string = authStore.user?.organizations[0].name || '';
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

    showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;
    
    constructor() {
        makeAutoObservable(this);
    }

    reset = () => {
        this.businessName = authStore.user?.organizations[0].name || '';
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
    }

    setShowAlert(showAlert: (params: ShowAlertParams) => void) {
        this.showAlert = showAlert;
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
            this.showAlert({
                title: 'Error Getting Link Data',
                message: 'An error occurred while getting link data. Please try again later.',
            });
        } finally {
            this.gettingLinkData = false;
        }
    }

    async submitCreateTeam() {
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
            this.showAlert({
                title: 'Error Creating Team',
                message: 'An error occurred while creating the team. Please try again later.',
            });
        } finally {
            this.createingTeamLoading = false;
        }
    }

    async pollJobStatus() {
        this.createingTeamLoading = true;
        try {
            const job = await getJob(this.jobId);
            console.log("Job:", job);
            if (job.status === 'completed') {
                agentsStore.loadAgents(true);
                this.stepForward();
            } else if (job.status === 'error') {
                this.showAlert({
                    title: 'Error Creating Team',
                    message: job.message,
                    actions: [
                        {
                            label: 'Go back and try again',
                            onClick: () => {
                                this.stepBack();
                            }
                        }
                    ]
                });
            } else {
                setTimeout(() => {
                    console.log("Polling job status repeate");
                    this.pollJobStatus();
                }, this.pollingTime);
            }
        } catch (error) {
            console.error('Error polling job status:', error);
            this.showAlert({
                title: 'Error Polling Job Status',
                message: 'An error occurred while polling the job status. Please try again later.',
            });
        } finally {
            this.createingTeamLoading = false;
        }
    };

}

export const createTeamStore = new CreateTeamStore();
