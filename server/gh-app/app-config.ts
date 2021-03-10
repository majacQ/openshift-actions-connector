import fetch from "node-fetch";

import Routes from "../routes/routes";

/* eslint-disable camelcase */
type GitHubAppConfig = Readonly<{
    id: number,
    slug: string,
    node_id: string
    owner: {
        login: string,
        id: number,
        node_id: string,
        avatar_url: string,
        gravatar_id: string,
        url: string,
        html_url: string,
        followers_url: string,
        following_url: string,
        gists_url: string,
        starred_url: string,
        subscriptions_url: string,
        organizations_url: string,
        repos_url: string,
        events_url: string,
        received_events_url: string,
        type: string,
        site_admin: boolean
    },
    name: string,
    description: string,
    external_url: string,
    html_url: string,
    created_at: string,     // iso date format
    updated_at: string,     // iso date format
    client_id: string,
    webhook_secret: string,
    pem: string,
    client_secret: string,
    permissions: {
        [key: string]: "read" | "write";
    },
    events: string[]
}>;

export type GitHubAppConfigNoSecrets = Omit<GitHubAppConfig, "webhook_secret" | "pem" | "client_secret">;

// https://stackoverflow.com/questions/42999983/typescript-removing-readonly-modifier
type Writeable<T> = { -readonly [K in keyof T]: T[K] };

namespace GitHubAppConfig {
    export async function createAppConfig(code: string): Promise<GitHubAppConfig> {
        console.log(`Exchanging code for app config...`);
        const codeConvertUrl = `https://api.github.com/app-manifests/${code}/conversions`;

        const convertResponse = await fetch(codeConvertUrl, { method: "POST" });

        const config: GitHubAppConfig | undefined = await convertResponse.json();

        if (config == null) {
            throw new Error("Failed to get app config!");
        }

        console.log(`Obtained app config for "${config.name}"`);
        return config;
    }

    export function getAppManifest(serverUrl: string): Record<string, unknown> {
        let serverUrlNoSlash = serverUrl;
        if (serverUrlNoSlash.endsWith("/")) {
            serverUrlNoSlash = serverUrlNoSlash.substring(0, serverUrlNoSlash.length - 1);
        }

        // eslint-disable-next-line camelcase
        const setup_url = serverUrlNoSlash + Routes.App.PostInstall;
        // eslint-disable-next-line camelcase
        const redirect_url = serverUrlNoSlash + Routes.App.PostCreate;

        // https://docs.github.com/en/developers/apps/creating-a-github-app-from-a-manifest#github-app-manifest-parameters
        // Tthe following parameters can also be in this payload
        // https://docs.github.com/en/developers/apps/creating-a-github-app-using-url-parameters#github-app-configuration-parameters
        return {
            name: "OpenShift Actions Connector",
            description: "Connect your OpenShift cluster to GitHub Actions",
            url: "https://github.com/redhat-actions",
            hook_attributes: {
                url: serverUrlNoSlash + Routes.Webhook,
            },
            // request_oauth_on_install: true,
            setup_url,
            redirect_url,
            setup_on_update: true,
            public: false,
            default_permissions: {
                actions: "write",
                secrets: "write",
            },
            default_events: [
                "workflow_run",
            ],
        };
    }

    export function getConfigWithoutSecrets(config: GitHubAppConfig): GitHubAppConfigNoSecrets {
        const configNoSecrets = { ...config } as Partial<Writeable<GitHubAppConfig>>;
        delete configNoSecrets.client_id;
        delete configNoSecrets.client_secret;
        delete configNoSecrets.pem;
        delete configNoSecrets.webhook_secret;

        return configNoSecrets as GitHubAppConfigNoSecrets;
    }
}

export default GitHubAppConfig;
