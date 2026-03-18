export interface ProfileEntity {
    roles:       Role[];
    company:     Company;
    profile:     Profile;
    permissions: any[];
}

export interface Company {
    id:          string;
    name:        string;
    created_at:  Date;
    description: string;
}

export interface Profile {
    id:           string;
    name:         string;
    email:        string;
    phone:        string;
    image_url:    null;
    is_active:    boolean;
    created_at:   Date;
    job_position: string;
}

export interface Role {
    id:   string;
    name: string;
}
