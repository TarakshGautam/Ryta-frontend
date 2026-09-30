declare module "universal-pwa/react" {
    interface UsePWAInstallOptions {
        appName?: string;
        themeColor?: string;
        description?: string;
        iconUrl?: string;
    }

    interface UsePWAInstallReturn {
        isInstallable: boolean;
        isInstalled: boolean;
        isIOS: boolean;
        isAndroid: boolean;
        isDesktop: boolean;
        isSupported: boolean;
        install: () => Promise<void>;
        dismiss: () => void;
    }

    export function usePWAInstall(
        options?: UsePWAInstallOptions
    ): UsePWAInstallReturn;

    export function PWAInstallButton(
        props: UsePWAInstallOptions & {
            className?: string;
        }
    ): JSX.Element;
}