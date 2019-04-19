import * as React from 'react';
import { store } from 'store';

import { Repository } from 'models/GitRepository';
import { Sequencer } from 'models/Sequencer';
import sequencers from 'services/sequencers';
import { Mpk } from 'services/MpkController';
import { TrackData } from 'components/screens/playground/track/trackData/trackData';
import { List, ListItem } from 'components/list/List';
import {
  AlgoListItem,
  AlgoListItemProps
} from 'components/list/items/AlgoListItem';
import { HelperIcon } from 'components/common/helperIcon/helperIcon';

import './SequenceCraftr.css';

export interface SequenceCraftrProps {}

export interface SequenceCraftrState {
  selectedRepo: number;
  selectedCommit: number;
  selectedSequencer: number;
}

export class SequenceCraftr extends React.Component<
  SequenceCraftrProps,
  SequenceCraftrState
> {
  updateRepoListener: (newIndex: number) => void;
  updateCommitListener: (newIndex: number) => void;
  updateSequencerListener: (newIndex: number) => void;

  repoCollection: Repository[] = [];
  repoCollectionList: ListItem[];
  sequencers: Sequencer[] = [];
  sequencersList: AlgoListItemProps[] = [];

  constructor(props: SequenceCraftrProps) {
    super(props);
    this.state = {
      selectedRepo: 0,
      selectedCommit: 0,
      selectedSequencer: 0
    };

    this.updateRepoListener = this.updateRepo.bind(this);
    this.updateCommitListener = this.updateCommit.bind(this);
    this.updateSequencerListener = this.updateSequencer.bind(this);

    const repoCollection = store.getState().session.gitRepositories;
    console.log(repoCollection);
    debugger;
    this.repoCollectionList = [];
    repoCollection.forEach((value, name) => {
      this.repoCollection.push(value);
      const [author, repoName] = name.split('/');
      this.repoCollectionList.push({
        title: repoName,
        subtitle: author
      });
    });

    Object.keys(sequencers).map(name => {
      this.sequencers.push(sequencers[name]);
      this.sequencersList.push({
        title: sequencers[name].name,
        subtitle: sequencers[name].description,
        icon: sequencers[name].icon
      });
    });
  }

  componentDidMount() {}

  updateRepo(newIndex: number) {
    this.setState({
      selectedRepo: newIndex,
      selectedCommit: 0
    });
  }

  updateCommit(newIndex: number) {
    this.setState({
      selectedCommit: newIndex
    });
  }

  updateSequencer(newIndex: number) {
    this.setState({
      selectedSequencer: newIndex
    });
  }

  componentWillUnmount() {
    // window.removeEventListener('keyup', this.keyUpListener)
  }

  render() {
    const selectedRepo = this.repoCollection[this.state.selectedRepo];
    const commitList = selectedRepo.commits.map(commit => {
      return {
        title: commit.hash,
        subtitle: commit.name
      };
    });

    // Calculate sequence
    var SHA = selectedRepo.commits[this.state.selectedCommit];
    var Algo = this.sequencers[this.state.selectedSequencer];
    var seq = Algo.algo(SHA, 2);

    return (
      <div className='sequence-craftr'>
        <div className='sequence-craftr-wrap'>
          <List
            index={this.state.selectedRepo}
            data={this.repoCollectionList}
            onUpdate={this.updateRepoListener}
            ref='red'
          />
          <List
            index={this.state.selectedCommit}
            data={commitList}
            onUpdate={this.updateCommitListener}
          />
          <List
            index={this.state.selectedSequencer}
            data={this.sequencersList}
            onUpdate={this.updateSequencerListener}
            component={AlgoListItem}
          />
        </div>
        <div>
          <TrackData data={seq} labels={['xyz', 'xxx']} />
        </div>
        <HelperIcon index={1} type='nob' />
        <HelperIcon index={3} type='pad' />
      </div>
    );
  }
}
