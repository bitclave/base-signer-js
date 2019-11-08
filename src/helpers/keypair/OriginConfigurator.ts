export interface OriginConfigurator {

    setAcceptedOrigins(origins: Set<string>);

    changeCurrentOrigin(origin: string);
}
