// @flow
import {
  VirtualizedList,
  View,
  TouchableOpacity,
  Image,
  Text
} from 'react-native'
import _ from 'lodash'
import moment from 'moment'
import React from 'react'

import styleConstructor from './style'

import DayView from './DayView'
import WeekView from './WeekView'

export default class EventCalendar extends React.Component {
  constructor(props) {
    super(props)
    this.styles = styleConstructor(props.styles)
    this.state = {
      date: moment(this.props.initDate),
      index: this.props.size
    }
  }

  static defaultProps = {
    size: 30,
    initDate: new Date(),
    formatHeader: 'DD MMMM YYYY'
  }

  _getItemLayout(data, index) {
    const { width } = this.props
    return { length: width, offset: width * index, index }
  };

  _getItem(events, index) {
    const date = moment(this.props.initDate).add(index - this.props.size, 'days')
    return _.filter(events, event => {
      const eventStartTime = moment(event.start)
      return eventStartTime >= date.clone().startOf('day') &&
        eventStartTime <= date.clone().endOf('day')
    })
  }

  _getItem2(events, index, initDate, size) {
    const date = moment(initDate).add(index - size, 'days')
    return _.filter(events, event => {
      const eventStartTime = moment(event.start)
      return eventStartTime >= date.clone().startOf('day') &&
        eventStartTime <= date.clone().endOf('day')
    })
  }

  _renderItem({ index, item }) {
    const { width, format24h, initDate, scrollToFirst } = this.props
    const date = moment(initDate).add(index - this.props.size, 'days')
    return (
          <DayView
            date={date}
            index={index}
            format24h={format24h}
            formatHeader={this.props.formatHeader}
            headerStyle={this.props.headerStyle}
            renderEvent={this.props.renderEvent}
            eventTapped={this.props.eventTapped}
            blankEventTapped={this.props.blankEventTapped}
            events={item}
            width={width}
            styles={this.styles}
            scrollToFirst={scrollToFirst}
            redlineVisible={this.props.redlineVisible}
          />
    )

  }

  _renderWeekView() {
    const { width, format24h, initDate, scrollToFirst } = this.props
    //const date = moment(initDate).add(index - this.props.size, 'days')
    return (
          <WeekView
            numberOfView={this.props.numberOfView ? this.props.numberOfView : 1}
            date={moment(initDate)}
            data={this.props.events}
            format24h={format24h}
            formatHeader={this.props.formatHeader}
            headerStyle={this.props.headerStyle}
            renderEvent={this.props.renderEvent}
            eventTapped={this.props.eventTapped}
            blankEventTapped={this.props.blankEventTapped}
            events={this.props.events}
            width={width}
            styles={this.styles}
            scrollToFirst={scrollToFirst}
            redlineVisible={this.props.redlineVisible}
          />
    )

  }

  _goToPage(index) {
    if (index <= 0 || index >= this.props.size * 2) {
      return
    }
    const date = moment(this.props.initDate).add(index - this.props.size, 'days')
    this.refs.calendar.scrollToIndex({ index, animated: false })
    this.setState({ index, date })
  }

  render() {
    const {
      width,
      virtualizedListProps,
      events,
      initDate,
      formatHeader
    } = this.props
    return (
      <View style={[this.styles.container, { width: width }]}>
        {this.props.headerVisible &&
          <View style={this.styles.header}>
            <TouchableOpacity onPress={() => this._goToPage(this.state.index - 1)}>
              <Image source={require('./back.png')} style={this.styles.arrow} />
            </TouchableOpacity>
            <Text style={this.styles.headerText}>{this.state.date.format(formatHeader || 'DD MMMM YYYY')}</Text>
            <TouchableOpacity onPress={() => this._goToPage(this.state.index + 1)}>
              <Image source={require('./forward.png')} style={this.styles.arrow} />
            </TouchableOpacity>
          </View>}
        {this.props.viewType === 'Day'
          ?
          <VirtualizedList
          ref='calendar'
          windowSize={2}
          initialNumToRender={2}
          initialScrollIndex={this.props.size}
          data={events}
          getItemCount={() => this.props.size * 2}
          getItem={this._getItem.bind(this)}
          keyExtractor={(item, index) => index}
          getItemLayout={this._getItemLayout.bind(this)}
          horizontal
          pagingEnabled
          scrollEnabled={this.props.scrollEnabled ? this.props.scrollEnabled : false}
          renderItem={this._renderItem.bind(this)}
          style={{ width: width }}
          onMomentumScrollEnd={(event) => {
            const index = parseInt(event.nativeEvent.contentOffset.x / width)
            const date = moment(this.props.initDate).add(index - this.props.size, 'days')
            console.log(date)
            this.setState({ index, date })
          }}
          {...virtualizedListProps}
        />
          :
          <View style={{width: width}}>
            {this._renderWeekView()}
            </View>
        }
        
      </View>

    )
  }
}
