import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Row from 'react-bootstrap/Row';
import Highlight from 'react-highlight';

function size(x) {
  let l = 0, n = parseInt(x, 10) || 0;
  while (n >= 1024 && ++l) {
    n = n/1024;
  }
  return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + ['b', 'kb', 'mb', 'gb', 'tb', 'pb', 'eb', 'zb', 'yb'][l]);
}

function App() {
  const [packages, setPackages] = useState([]);
  useEffect(() => {
    fetch('https://rpm.manta.systems/packages.json')
      .then(response => response.json())
      .then((packages) => setPackages(packages.map((p) => ({
        ...p,
        name: p.key.split('/').reverse()[0].split('-')[0],
        version: p.key.split('/').reverse()[0].replace('manta-', '').replace('.fc35.x86_64.rpm', ''),
        arch: p.key.split('/')[1],
      }))))
      .catch(console.error);
  }, []);
  return (
    <Container>
      <Row>
        <h1>manta rpm repository</h1>
        <h3>dnf/yum (.rpm) packages built on and for fedora (35) x86_64</h3>
      </Row>
      <Row>
        <Tabs defaultActiveKey="tldr" className="mb-3">
          <Tab eventKey="repo" title="add the repo">
            <h4>add this repository to your dnf sources</h4>
            <p>
              check the <a href="https://keys.mailvelope.com/pks/lookup?op=get&search=security@manta.network">manta security public key</a>:
            </p>
            <p>
              fetch and store the manta dnf repository definition:
            </p>
            <Highlight className="language-bash">
              {
                [
                  `#!/bin/bash`,
                  `sudo dnf install -y dnf-plugins-core`,
                  `sudo dnf config-manager --add-repo https://rpm.manta.systems/manta.repo`,
                  `sudo dnf config-manager --set-enabled manta`,
                  `sudo dnf update`
                ].join('\n')
              }
            </Highlight>
          </Tab>
          <Tab eventKey="install" title="install manta">
            <h4>install, update or remove the manta node binary and the manta and calamari systemd services</h4>
            <p>
              manta .rpm packages include:
            </p>
            <ul style={{paddingLeft: '2em'}}>
              <li>
                binary/executable
                <ul>
                  <li>
                    <code>/usr/bin/manta</code>
                    <span className="text-muted">: the manta binary</span>
                  </li>
                  <li>
                    <code>/usr/bin/calamari</code>
                    <span className="text-muted">: a symlink to the manta binary</span>
                  </li>
                </ul>
              </li>
              <li>
                service/daemon configurations
                <ul>
                  <li>
                    <code>/usr/lib/systemd/system/manta.service</code>
                    <span className="text-muted">
                      : manta systemd unit file
                      (source: <a href="https://github.com/Manta-Network/Manta/blob/deb-rpm/scripts/package/manta.service">github/Manta-Network/Manta/manta.service</a>)
                    </span>
                  </li>
                  <li>
                    <code>/usr/lib/systemd/system/calamari.service</code>
                    <span className="text-muted">
                      : calamari systemd unit file
                      (source: <a href="https://github.com/Manta-Network/Manta/blob/deb-rpm/scripts/package/calamari.service">github/Manta-Network/Manta/calamari.service</a>)
                    </span>
                  </li>
                </ul>
              </li>
              <li>
                blockchain specifications
                <ul>
                  <li>
                    <code>/usr/share/substrate/calamari.json</code>
                    <span className="text-muted">
                      : calamari parachain chainspec
                      (source: <a href="https://github.com/Manta-Network/Manta/blob/manta/genesis/calamari-genesis.json">github/Manta-Network/Manta/calamari</a>)
                    </span>
                  </li>
                  <li>
                    <code>/usr/share/substrate/kusama.json</code>
                    <span className="text-muted">
                      : kusama relay chainspec
                      (source: <a href="https://github.com/paritytech/polkadot/blob/master/node/service/res/kusama.json">github/paritytech/polkadot/kusama</a>)
                    </span>
                  </li>
                  <li>
                    <code>/usr/share/substrate/manta.json</code>
                    <span className="text-muted">
                      : manta parachain chainspec
                      (source: <a href="https://github.com/Manta-Network/Manta/blob/manta/genesis/manta-genesis.json">github/Manta-Network/Manta/manta</a>)
                    </span>
                  </li>
                  <li>
                    <code>/usr/share/substrate/polkadot.json</code>
                    <span className="text-muted">
                      : polkadot relay chainspec
                      (source: <a href="https://github.com/paritytech/polkadot/blob/master/node/service/res/polkadot.json">github/paritytech/polkadot/polkadot</a>)
                    </span>
                  </li>
                </ul>
              </li>
            </ul>
            <p>
              when a manta .rpm package is installed, the preinstall script will create a system user with username: <code>manta</code>.
              <br />
              the home directory of the <code>manta</code> system user: <code>/var/lib/substrate</code>, is created simultaneously. this <em>"home"</em> directory is also referred to in subtstrate terminology as the <strong><em>basepath</em></strong>.
              <br />
              when the manta binary/executable is run, it will begin to sync both the relay-chain and parachain blockchains to the <code>/var/lib/substrate</code> basepath.
              the basepath will grow in size to accomodate these blockchains and will require in excess of 60 gb of disk space. it is sensible to budget up to 240 gb of disk space per relay-chain/parachain pair.
              it is normal that it will take between one and two weeks to completely synchronise a relay chain and parachain.
            </p>
            <p>
              install latest manta package:
            </p>
            <Highlight className="language-bash">
              {
                [
                  `#!/bin/bash`,
                  `sudo dnf check-update`,
                  `sudo dnf update manta`
                ].join('\n')
              }
            </Highlight>
            <p>
              install a specific version of manta which is not the latest version:
            </p>
            <Highlight className="language-bash">
              {
                [
                  `#!/bin/bash`,
                  `version=3.1.1`,
                  'sudo dnf install https://rpm.manta.systems/RPMS/x86_64/manta-${version}-0.fc35.x86_64.rpm',
                ].join('\n')
              }
            </Highlight>
            <p>
              upgrade to the latest manta package:
            </p>
            <Highlight className="language-bash">
              {
                [
                  `#!/bin/bash`,
                  `sudo dnf update`,
                  `sudo dnf install manta`
                ].join('\n')
              }
            </Highlight>
            <p>
              uninstall manta:
            </p>
            <Highlight className="language-bash">
              {
                [
                  `#!/bin/bash`,
                  `sudo dnf remove manta`
                ].join('\n')
              }
            </Highlight>
          </Tab>
          <Tab eventKey="run" title="run manta">
            <h4>check, enable and start manta/calamari service(s)</h4>
            <p>
              check the status of the calamari service:
            </p>
            <Highlight className="language-bash">
              {
                [
                  `#!/bin/bash`,
                  `systemctl status calamari.service`
                ].join('\n')
              }
            </Highlight>
            <p>
              enable calamari service (the service will start automatically on system boot):
            </p>
            <Highlight className="language-bash">
              {
                [
                  `#!/bin/bash`,
                  `sudo systemctl enable calamari.service`
                ].join('\n')
              }
            </Highlight>
            <p>
              enable and start calamari service immediately:
            </p>
            <Highlight className="language-bash">
              {
                [
                  `#!/bin/bash`,
                  `sudo systemctl enable --now calamari.service`
                ].join('\n')
              }
            </Highlight>
            <p>
              start calamari service:
            </p>
            <Highlight className="language-bash">
              {
                [
                  `#!/bin/bash`,
                  `sudo systemctl start calamari.service`
                ].join('\n')
              }
            </Highlight>
            <p>
              stop calamari service:
            </p>
            <Highlight className="language-bash">
              {
                [
                  `#!/bin/bash`,
                  `sudo systemctl stop calamari.service`
                ].join('\n')
              }
            </Highlight>
            <p>
              tail the calamari service logs:
            </p>
            <Highlight className="language-bash">
              {
                [
                  `#!/bin/bash`,
                  `journalctl -u calamari.service -f`
                ].join('\n')
              }
            </Highlight>
            <p>
              debug calamari service configuration (run calamari as the manta user, to quickly check for runtime errors):
            </p>
            <Highlight className="language-bash">
              {
                [
                  `#!/bin/bash`,
                  `sudo -H -u manta bash -c '/usr/bin/calamari --chain /usr/share/substrate/calamari.json --base-path /var/lib/substrate --port 31333 --ws-port 9144 --ws-max-connections 100 --rpc-port 9133 --rpc-cors all --rpc-methods safe --state-cache-size 0 --bootnodes /dns/crispy.calamari.systems/tcp/30333/p2p/12D3KooWNE4LBfkYB2B7D4r9vL54YMMGsfAsXdkhWfBw8VHJSEQc /dns/crunchy.calamari.systems/tcp/30333/p2p/12D3KooWL3ELxcoMGA6han3wPQoym5DKbYHqkWkCuqyjaCXpyJTt /dns/hotdog.calamari.systems/tcp/30333/p2p/12D3KooWBdto53HnArmLdtf2RXzNWti7hD5mML7DWGZPD8q4cywv /dns/tasty.calamari.systems/tcp/30333/p2p/12D3KooWGs2hfnRQ3Y2eAoUyWKUL3g7Jmcsf8FpyhVYeNpXeBMSu /dns/tender.calamari.systems/tcp/30333/p2p/12D3KooWNXZeUSEKRPsp1yiDH99qSVawQSWHqG4umPjgHsn1joci -- --chain /usr/share/substrate/kusama.json'`
                ].join('\n')
              }
            </Highlight>
          </Tab>
          <Tab eventKey="fast-sync" title="fast sync">
            <h4>download blockchain database snapshots</h4>
            <p>
              syncing a parachain database in the recommended way, by running a parachain node, can take a very long time because both the parachain and relay-chain databases need to be synced over the peer-to-peer, decentralised network.
              it is not uncommon for a full kusama relay-chain sync to require between one and two weeks to complete.
            </p>
            <p>
              to sync your node quickly, you may be able to use manta inc. snapshots hosted on amazon s3.
              this facility may be removed or suspended at any time and there is no guarantee of the availability of snapshots.
            </p>
            <p>
              the shell commands below assume the basepath to be in the default location: <code>/var/lib/substrate</code>. it is also assumed that the basepath is owned by the <code>manta</code> user.
              the download of the blockchain database archive is piped through <code>tar</code> for extraction in order to reduce the amount of disk space that would be required to hold both the archive (.tar.gz) file and the extracted database files.
            </p>
            <h5>calamari database</h5>
            <Highlight className="language-bash">
              {
                [
                  `#!/bin/bash`,
                  `# delete calamari blockchain database folder`,
                  `sudo -H -u manta rm -rf /var/lib/substrate/chains/calamari/db/full`,
                  `# create calamari blockchain database folder`,
                  `sudo -H -u manta mkdir -p /var/lib/substrate/chains/calamari/db/full`,
                  `# download and extract calamari blockchain database folder`,
                  `curl https://calamari-kusama.s3.amazonaws.com/calamari.tar.gz | sudo -H -u manta tar -xzC /var/lib/substrate/chains/calamari/db/full`
                ].join('\n')
              }
            </Highlight>
            <h5>kusama database</h5>
            <Highlight className="language-bash">
              {
                [
                  `#!/bin/bash`,
                  `# delete kusama blockchain database folder`,
                  `sudo -H -u manta rm -rf /var/lib/substrate/polkadot/chains/ksmcc3/db/full`,
                  `# create kusama blockchain database folder`,
                  `sudo -H -u manta mkdir -p /var/lib/substrate/polkadot/chains/ksmcc3/db/full`,
                  `# download and extract kusama blockchain database folder`,
                  `curl https://calamari-kusama.s3.amazonaws.com/kusama.tar.gz | sudo -H -u manta tar -xzC /var/lib/substrate/polkadot/chains/ksmcc3/db/full`
                ].join('\n')
              }
            </Highlight>
          </Tab>
          <Tab eventKey="tldr" title="tl;dr">
            <h4>install and start a calamari node on fedora as quickly as possible</h4>
            <Highlight className="language-bash">
              {
                [
                  `#!/bin/bash`,
                  `sudo dnf install -y dnf-plugins-core`,
                  `sudo dnf config-manager --add-repo https://rpm.manta.systems/manta.repo`,
                  `sudo dnf config-manager --set-enabled manta`,
                  `sudo dnf update`,
                  `sudo dnf install manta -y`,
                  `sudo systemctl enable --now calamari.service`
                ].join('\n')
              }
            </Highlight>
          </Tab>
          <Tab eventKey="packages" title="packages">
            <h4>
              packages available from this repository
            </h4>
            <ul>
              {
                [...new Set(packages.map((p) => p.name))].map((name) => (
                  <li key={name}>
                    <strong>{name}</strong>
                    <ul>
                      {
                        [...new Set(packages.filter(p => p.name === name).map(p => p.arch))].map((arch) => (
                          <li key={arch}>
                            {arch}
                            <ul>
                              {
                                packages.filter(p => p.name === name && p.arch === arch).sort((a, b) => ((a.version > b.version) ? 1 : (a.version < b.version) ? -1 : 0)).reverse().map((p) => (
                                  <li key={p.version}>
                                    <a href={`https://deb.manta.systems/${p.key}`}>
                                      {p.version}
                                    </a>
                                    <span style={{marginLeft: '0.5em'}} className="text-muted">
                                      ({p.key.split('/').reverse()[0]})
                                    </span>
                                    <br />
                                    <span>
                                      {size(p.size)}
                                    </span>
                                    <span style={{marginLeft: '0.5em'}} className="text-muted">
                                      last modified: {new Intl.DateTimeFormat('en-GB').format(new Date(p.modified))}
                                    </span>
                                  </li>
                                ))
                              }
                            </ul>
                          </li>
                        ))
                      }
                    </ul>
                  </li>
                ))
              }
            </ul>
          </Tab>
        </Tabs>
      </Row>
      <Row>
        <p className="text-muted">
          see: <a href="https://deb.manta.systems/">deb.manta.systems</a> for ubuntu (.deb) packages.
        </p>
      </Row>
    </Container>
  );
}

export default App;
