import { BatchCommands } from './index';

/**
 * Installs core OS packages and dev tools that are a dependency for most dev scenarios and frameworks installed in this package
 */
export default {
    commands: `

yum update -y
yum install zsh openssl-devel amazon-efs-utils nfs-utils openssl-libs compat-openssl10 krb5-libs zlib libicu libsecret gnome-keyring desktop-file-utils xorg-x11-utils -y
yum group install "Development Tools" -y
echo 'fs.inotify.max_user_watches=524288' >> /etc/sysctl.conf

`,
} as BatchCommands;
