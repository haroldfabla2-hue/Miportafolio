import { Injectable } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { ProjectsService } from '../crm/projects/projects.service';
import { ClientsService } from '../crm/clients/clients.service';
import { CrmService } from '../crm/crm.service';

@Injectable()
export class ToolsService {
    constructor(
        private readonly tasksService: TasksService,
        private readonly projectsService: ProjectsService,
        private readonly clientsService: ClientsService,
        private readonly crmService: CrmService,
    ) { }

    private tools = {
        'create_task': {
            description: 'Create a new task. Args: title (string), description? (string), priority? (LOW|MEDIUM|HIGH)',
            execute: async (args: any, user: any) => this.tasksService.create({ ...args, creatorId: user.id })
        },
        'list_tasks': {
            description: 'List tasks. Args: status? (TODO|IN_PROGRESS|DONE)',
            execute: async (args: any, user: any) => {
                const tasks = await this.tasksService.findAll(user);
                if (args.status) return tasks.filter(t => t.status === args.status);
                return tasks.slice(0, 10);
            }
        },
        'get_dashboard_stats': {
            description: 'Get CRM statistics (projects, revenue, etc)',
            execute: async (args: any, user: any) => this.crmService.getStats(user)
        },
        'list_projects': {
            description: 'List active projects',
            execute: async (args: any, user: any) => this.crmService.getActiveProjects()
        },
        'create_project': {
            description: 'Create a project. Args: name (string), description? (string), clientId? (string)',
            execute: async (args: any, user: any) => this.projectsService.create({ ...args, managerId: user.id })
        },
        'search_projects': {
            description: 'Search projects by name. Args: query (string)',
            execute: async (args: any, user: any) => {
                const projects = await this.projectsService.findAll(user);
                return projects.filter(p => p.name.toLowerCase().includes(args.query.toLowerCase()));
            }
        },
        'get_project_details': {
            description: 'Get full details of a specific project. Args: projectId (string)',
            execute: async (args: any, user: any) => this.projectsService.findOne(args.projectId)
        },
        'list_clients': {
            description: 'List or search clients. Args: query? (string)',
            execute: async (args: any, user: any) => {
                const clients = await this.clientsService.findAll(user);
                if (args.query) {
                    return clients.filter(c =>
                        c.name.toLowerCase().includes(args.query.toLowerCase()) ||
                        c.company?.toLowerCase().includes(args.query.toLowerCase())
                    );
                }
                return clients.slice(0, 10);
            }
        },
        'get_client_history': {
            description: 'Get history and details for a client. Args: clientId (string)',
            execute: async (args: any, user: any) => this.clientsService.findOne(args.clientId)
        },
        'create_client': {
            description: 'Create a client. Args: name (string), company? (string), email? (string)',
            execute: async (args: any, user: any) => this.clientsService.create({ ...args, ownerId: user.id })
        },
        'update_task': {
            description: 'Update a task. Args: taskId (string), updates (object)',
            execute: async (args: any, user: any) => this.tasksService.update(args.taskId, args.updates)
        }
    };

    getToolDefinitions() {
        return Object.entries(this.tools).map(([name, tool]) => ({
            name,
            description: tool.description
        }));
    }

    async executeTool(name: string, args: any, user: any) {
        const tool = this.tools[name];
        if (!tool) throw new Error(`Tool ${name} not found`);
        console.log(`[Iris] Executing tool ${name} for user ${user.id}`, args);
        return tool.execute(args, user);
    }
}
