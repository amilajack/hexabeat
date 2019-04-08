import * as React from 'react';
import { store, actions } from 'store';
import { Mpk, MpkKey } from 'services/MpkController';
import { Picker } from 'components/picker';
import { SampleGroup } from 'models/Liveset';
import Track from 'models/Track';

import './index.css';

export interface TrackGeneratorProps {}

export interface TrackGeneratorState {
  sampleGroups: SampleGroup[];
  pickerIndex: number;
  pickerIsSelected: boolean;
}

/**
 * TrackGenerator component
 *
 * Components:
 * - LivesetPicker
 * - LivesetUploader
 * - LivesetStart
 */
export class TrackGenerator extends React.Component<
  TrackGeneratorProps,
  TrackGeneratorState
> {
  isActive = false;
  drapPos = 0;
  onUpdate = this.onUpdateListener.bind(this);
  unsubscribeMpk: () => void;

  unsubscribeStore = store.subscribe(() => {
    const sampleGroups = store.getState().session.liveset.sampleGroups;
    const isActive = store.getState().session.selectedTrack === -1;

    if (this.isActive !== isActive) {
      if (isActive) {
        this.takeControlMPK();
      } else {
        this.releaseControlMPK();
      }
      this.isActive = isActive;
    }

    if (sampleGroups !== this.state.sampleGroups) {
      this.setState({
        sampleGroups: sampleGroups
      });
    }
  });

  takeControlMPK() {
    this.unsubscribeMpk = Mpk.takeControl({
      // Select choice
      [MpkKey.nob1]: (diff: number) => {
        this.drapPos += diff;
        this.setState({
          pickerIsSelected: false,
          pickerIndex: Math.floor(this.drapPos / 5)
        });
      },
      [MpkKey.pad1]: () => {
        this.setState({
          pickerIsSelected: true
        });
        this.addTrack(this.state.pickerIndex);
      },
      // Escape
      [MpkKey.pad4]: () => {
        this.releaseControlMPK();
        this.setState({
          pickerIsSelected: false,
          pickerIndex: 0
        });
      }
    });
  }

  releaseControlMPK() {
    if (this.unsubscribeMpk) {
      this.unsubscribeMpk();
      this.unsubscribeMpk = null;
    }
  }

  constructor(props: TrackGeneratorProps) {
    super(props);
    let liveset = store.getState().session.liveset;
    this.state = {
      sampleGroups: liveset
        ? [
            ...liveset.sampleGroups,
            ...liveset.sampleGroups,
            ...liveset.sampleGroups,
            ...liveset.sampleGroups
          ]
        : [],
      pickerIndex: 0,
      pickerIsSelected: false
    };
  }

  onUpdateListener(index: number) {
    this.setState({
      pickerIndex: index,
      pickerIsSelected: true
    });
    this.addTrack(index);
  }

  componentWillUnmount() {
    this.unsubscribeStore();
    this.releaseControlMPK();
  }

  addTrack(index: number) {
    let tr = new Track(this.state.sampleGroups[index]);
    store.dispatch(actions.addTrack(tr));
  }

  render() {
    return (
      <div>
        <Picker
          data={this.state.sampleGroups}
          index={this.state.pickerIndex}
          isSelected={this.state.pickerIsSelected}
          component={TrackGeneratorItem}
          onUpdate={this.onUpdate}
        />
      </div>
    );
  }
}

export interface TrackGeneratorItemProps {
  item: SampleGroup;
  isActive: boolean;
  isSelected: boolean;
  onSelect: (index: number) => void;
  index: number;
}

export class TrackGeneratorItem extends React.Component<
  TrackGeneratorItemProps
> {
  clickListener = this.onClick.bind(this);
  onClick() {
    this.props.onSelect(this.props.index);
  }
  render() {
    let { item, isActive, isSelected } = this.props;
    let classes = ['track-generator-item', 'picker-item'];

    if (isActive) {
      classes.push('active');
    }
    if (isActive && isSelected) {
      classes.push('active selected');
    }

    return (
      <div className={classes.join(' ')} onClick={this.clickListener}>
        <div className='track-generator-item-icon'>
          <span className={'icon-' + item.icon} />
        </div>
        <div className='track-generator-item-content'>
          <div className='track-generator-item-title'>{item.name}</div>
          <div className='track-generator-item-subtitle'>
            SMPL.0{item.samples.length}
          </div>
        </div>
      </div>
    );
  }
}
