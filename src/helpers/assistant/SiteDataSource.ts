import { Site } from '../../models/Site';

export interface SiteDataSource {

    getSiteData(origin: string): Site;
}
