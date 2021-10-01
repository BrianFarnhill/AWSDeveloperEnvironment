import { BatchCommands } from './index';

/**
 * Installs VSCode server for web based IDE support
 */
const vscodeServerVersion = '1.60.2'; // Versions from https://github.com/gitpod-io/openvscode-server/releases 

export default {
    fileMap: {
        'vscode-server/settings.json': '/home/ec2-user/.opencode-server/Machine/settings.json',
        'vscode-server/install-extensions.sh': '/home/ec2-user/.opencode-server/install-extensions.sh',
    },
    commands: `

sudo -u ec2-user wget https://github.com/gitpod-io/openvscode-server/releases/download/openvscode-server-v${vscodeServerVersion}/openvscode-server-v${vscodeServerVersion}-linux-x64.tar.gz -O code-server.tar.gz
sudo -u ec2-user tar -xzf code-server.tar.gz
sudo -u ec2-user rm code-server.tar.gz

chmod u+x /home/ec2-user/openvscode-server-v${vscodeServerVersion}-linux-x64/server.sh

cat <<EOT >> /etc/systemd/system/vscode-server.service
[Unit]
Description=VSCode Server
DefaultDependencies=no
After=network.target

[Service]
Type=simple
User=ec2-user
ExecStart=/home/ec2-user/openvscode-server-v${vscodeServerVersion}-linux-x64/server.sh
TimeoutStartSec=0
RemainAfterExit=yes

[Install]
WantedBy=default.target
EOT

systemctl daemon-reload
systemctl enable vscode-server.service
systemctl restart vscode-server.service

mkdir -p $(dirname '/home/ec2-user/.opencode-server/Machine/settings.json')

`,
} as BatchCommands;
