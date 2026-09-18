import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { AxiosInstance } from "axios";
import { KONG_CONFIG } from "./kong-config.js";

@Injectable()
export class KongService {
    private readonly logger = new Logger(KongService.name);
    private adminApi: AxiosInstance;

    constructor(private readonly httpService: HttpService) {
        this.adminApi = this.httpService.axiosRef;
        this.adminApi.defaults.baseURL = KONG_CONFIG.adminUrl;
        this.adminApi.defaults.headers.common['Content-Type'] = 'application/json';

        this.adminApi.interceptors.response.use(
            (response) => response,
            (error) => {
                const status = error.response?.status;
                const cfg = error.config?.url;
                const data = error.response?.data;
                // 404 on existence checks is expected; treat as debug, not error
                if (status === 404) {
                    this.logger.debug(
                        `Kong endpoint not found (expected for existence check) (URL: ${cfg})`,
                        { data },
                    );
                } else {
                    this.logger.error(
                        `Error al conectar con Kong Admin API (URL: ${cfg}, status: ${status})`,
                        { data, stack: error.stack },
                    );
                }
                return Promise.reject(error);
            },
        );
    }

    async setupKong() {
        this.logger.log('🚀 Configurando Kong...');

        for (const service of KONG_CONFIG.services) {
            try {
                // Crear o actualizar servicio
                await this.createService(service);

                // Crear rutas
                for (const route of service.routes) {
                    await this.createRoute(service.name, route);
                }

                // Agregar plugins
                for (const plugin of service.plugins) {
                    await this.addPlugin(service.name, plugin);
                }

                this.logger.log(`✅ Servicio '${service.name}' configurado`);
            } catch (err: any) {
                this.logger.error(`❌ Error configurando ${service.name}:`, err.message);
            }
        }

        this.logger.log('✨ Kong configurado exitosamente!');
    }

    async createService(service: any) {
        try {
            await this.adminApi.get(`/services/${service.name}`);
            this.logger.log(`Service ${service.name} ya existe`);
        }
        catch (err: any) {
            if (err.response?.status === 404) {
                await this.adminApi.post('/services', {
                    name: service.name,
                    url: service.url,
                });
                this.logger.log(`Servicio '${service.name}' creado`);
            }
        }
    }

    async createRoute(serviceName: string, route: any) {
        try {
            await this.adminApi.get(`/services/${serviceName}/routes/${route.name}`);
            this.logger.log(`Ruta '${route.name}' ya existe`);
        } catch (err: any) {
            if (err.response?.status === 404) {
                await this.adminApi.post(`/services/${serviceName}/routes`, route);
                this.logger.log(`Ruta '${route.name}' creada`);
            }
        }
    }

    private async addPlugin(serviceName: string, plugin: any) {
        try {
            // Verificar si el plugin ya existe
            const plugins = await this.adminApi.get(
                `/services/${serviceName}/plugins`
            );
            const exists = plugins.data.data.some((p: any) => p.name === plugin.name);

            if (!exists) {
                await this.adminApi.post(`/services/${serviceName}/plugins`, plugin);
                this.logger.log(`Plugin '${plugin.name}' agregado a ${serviceName}`);
            } else {
                this.logger.log(`Plugin '${plugin.name}' ya existe`);
            }
        } catch (err: any) {
            this.logger.error(`Error al agregar plugin ${plugin.name}:`, err.message);
        }
    }
}