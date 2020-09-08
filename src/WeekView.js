// @flow
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image
} from 'react-native'
import populateEvents from './Packer'
import React from 'react'
import moment from 'moment'
import _ from 'lodash'
import BlockedTime from './BlockedTime.png';
import BlockedTimeWeek from './BlockedTimeWeek.png';

const LEFT_MARGIN = 60 - 1
// const RIGHT_MARGIN = 10
const CALENDER_HEIGHT = 2400
// const EVENT_TITLE_HEIGHT = 15
const TEXT_LINE_HEIGHT = 17
// const MIN_EVENT_TITLE_WIDTH = 20
// const EVENT_PADDING_LEFT = 4

function range(from, to) {
    return Array.from(Array(to), (_, i) => from + i)
}

export default class WeekView extends React.PureComponent {
    constructor(props) {
        super(props)
        const width = ((props.width - LEFT_MARGIN) / props.numberOfView)
        //console.log(props.events)
        //console.log("DARTA")
        //console.log(props.data)
        //console.log(props.initDate);
        //console.log(props.size)
        //console.log(props.getItem(props.events, props.index, props.initDate, props.size))
        const packedEvents = populateEvents(props.events, width)
        let initPosition = _.min(_.map(packedEvents, 'top')) - CALENDER_HEIGHT / 24
        initPosition = initPosition < 0 ? 0 : initPosition
        this.state = {
            _scrollY: initPosition,
            packedEvents,
            width: width
        }
    }

    componentWillReceiveProps(nextProps) {
        const width = ((nextProps.width - LEFT_MARGIN) / this.props.numberOfView)
        this.setState({
            packedEvents: populateEvents(nextProps.events, width)
        })
    }

    componentDidMount() {
        this.props.scrollToFirst && this.scrollToFirst()
    }

    scrollToFirst() {
        setTimeout(() => {
            if (this.state && this.state._scrollY && this._scrollView) {
                this._scrollView.scrollTo({ x: 0, y: this.state._scrollY, animated: true })
            }
        }, 1)
    }

    _renderRedLine() {
        const offset = CALENDER_HEIGHT / 24
        const { format24h } = this.props
        const { width, styles } = this.props
        const timeNowHour = moment().hour()
        const timeNowMin = moment().minutes()
        return (
            <>
                <View style={{
                    marginLeft: 50 - 1, top: offset * timeNowHour + offset * timeNowMin / 60 - 4, width: width - 20,

                    width: 8, height: 8, borderRadius: 8, backgroundColor: styles.lineNow.backgroundColor
                }} />
                <View key={`timeNow`}
                    style={[styles.lineNow, { top: offset * timeNowHour + offset * timeNowMin / 60, width: width - 20 }]}
                />
            </>
        )
    }

    _renderLines() {
        const offset = CALENDER_HEIGHT / 24
        const { format24h } = this.props;
        return range(0, 25).map((item, i) => {
            let timeText
            if (i === 0) {
                timeText = ``
            } else if (i < 12) {
                timeText = !format24h ? `${i} AM` : i
            } else if (i === 12) {
                timeText = !format24h ? `${i} PM` : i
            } else if (i === 24) {
                timeText = !format24h ? `12 AM` : 0
            } else {
                timeText = !format24h ? `${i - 12} PM` : i
            }
            const { width, styles } = this.props
            let startTime = moment(`${moment(this.props.date).format('YYYY-MM-DD')} ${i.toString().length < 2 ? `0${i}` : i}:00`);
            let endTime = moment(`${moment(this.props.date).format('YYYY-MM-DD')} ${(i + 1).toString().length < 2 ? `0${i + 1}` : i + 1}:00`)
            let startHalfTime = moment(`${moment(this.props.date).format('YYYY-MM-DD')} ${i.toString().length < 2 ? `0${i}` : i}:30`);
            let endHalfTime = moment(`${moment(this.props.date).format('YYYY-MM-DD')} ${(i + 1).toString().length < 2 ? `0${i + 1}` : i + 1}:30`);
            return [
                <Text
                    key={`timeLabel${i}`}
                    style={[styles.timeLabel, { top: offset * i - 6, }]}
                >
                    {timeText}
                </Text>,
                this.props.numberOfView === 1 &&
                <View
                    key={`line${i}`}
                    style={[styles.line, { top: (offset * i) - 1, left: LEFT_MARGIN - 10, width: 10, }]}
                />,
                this.props.numberOfView === 1 &&
                <View
                    key={`line${i}`}
                    style={[styles.line, { top: (offset * (i + 0.5)) - 1, left: LEFT_MARGIN - 10, width: 10, }]}
                />,
                range(0, this.props.numberOfView).map((it, ind) => (
                    i === 24 ? null : (
                        <TouchableOpacity
                            key={`line${i}`}
                            onPress={() => this._onBlankEventTapped({ startTime: moment(startTime).add(ind, 'days').toISOString(), endTime: moment(endTime.add(ind, 'days')).toISOString() })}
                            disabled={this.props.availability && (
                                (parseInt(moment(startTime).add(ind, 'days').format('H')) < this.props.availability[moment(startTime).add(ind, 'days').format('dddd').toUpperCase()][0].startHour)
                                || (this.props.availability[moment(endTime).add(ind, 'days').format('dddd').toUpperCase()][0].endHour <= parseInt(moment(startTime).add(ind, 'days').format('H')))

                            )}
                            style={[styles.line, { borderLeftWidth: 1, borderLeftColor: 'rgb(216,216,216)', top: offset * i, left: LEFT_MARGIN + ind * this.state.width, width: this.state.width, height: offset * 0.5, backgroundColor: 'transparent', borderBottomColor: 'rgb(216,216,216)', borderBottomWidth: 1 }]}
                        >
                            {this.props.availability && (
                                (parseInt(moment(startTime).add(ind, 'days').format('H')) < this.props.availability[moment(startTime).add(ind, 'days').format('dddd').toUpperCase()][0].startHour)
                                || (this.props.availability[moment(endTime).add(ind, 'days').format('dddd').toUpperCase()][0].endHour <= parseInt(moment(startTime).add(ind, 'days').format('H')))

                            )
                                ?
                                <Image source={this.props.numberOfView < 7 ? BlockedTime : BlockedTimeWeek} style={{ width: '100%', height: '100%' }} />
                                :
                                null
                            }
                        </TouchableOpacity>
                    )
                )),
                range(0, this.props.numberOfView).map((it, ind) => (
                    i === 24 ? null : (
                        <TouchableOpacity
                            key={`lineHalf${i}`}
                            onPress={() => this._onBlankEventTapped({ startTime: moment(startHalfTime).add(ind, 'days').toISOString(), endTime: moment(endHalfTime).add(ind, 'days').toISOString() })}
                            disabled={this.props.availability && (
                                (parseInt(moment(startHalfTime).add(ind, 'days').format('H')) < this.props.availability[moment(startHalfTime).add(ind, 'days').format('dddd').toUpperCase()][0].startHour)
                                || (this.props.availability[moment(endTime).add(ind, 'days').format('dddd').toUpperCase()][0].endHour <= parseInt(moment(startHalfTime).add(ind, 'days').format('H')))
                            )}
                            style={[styles.line, { borderLeftWidth: 1, borderLeftColor: 'rgb(216,216,216)', top: offset * (i + 0.5), left: LEFT_MARGIN + ind * this.state.width, width: this.state.width, height: offset * 0.5, backgroundColor: 'transparent', borderBottomColor: 'rgb(216,216,216)', borderBottomWidth: 1 }]}
                        >
                            {this.props.availability && (
                                (parseInt(moment(startHalfTime).add(ind, 'days').format('H')) < this.props.availability[moment(startHalfTime).add(ind, 'days').format('dddd').toUpperCase()][0].startHour)
                                || (this.props.availability[moment(endTime).add(ind, 'days').format('dddd').toUpperCase()][0].endHour <= parseInt(moment(startHalfTime).add(ind, 'days').format('H')))
                            )
                                ?
                                < Image source={this.props.numberOfView < 7 ? BlockedTime : BlockedTimeWeek} style={{ width: '100%', height: '100%' }} />
                                : null
                            }
                        </TouchableOpacity>
                    )
                )),

            ]
        })

    };

    _renderTimeLabels() {
        const { styles } = this.props
        const offset = CALENDER_HEIGHT / 24
        return range(0, 24).map((item, i) => {
            return (
                <View key={`line${i}`} style={[styles.line, { top: offset * i }]} />
            )
        })
    }

    _onBlankEventTapped(time) {
        this.props.blankEventTapped(time)
    }

    _onEventTapped(event) {
        this.props.eventTapped(event)
    };

    _renderEvents() {
        const { styles } = this.props
        const { packedEvents } = this.state
        let events = packedEvents.map((event, i) => {
            //console.log(event);
            //console.log('packed')
            const style = {
                left: event.left + moment(event.start).diff(this.props.date, 'days') * this.state.width,
                height: event.height,
                width: event.width,
                top: event.top,
                borderWidth: 2,
                borderColor: event.color,
                borderRadius: 5,
            }

            // Fixing the number of lines for the event title makes this calculation easier.
            // However it would make sense to overflow the title to a new line if needed
            const numberOfLines = Math.floor(event.height / TEXT_LINE_HEIGHT)
            const formatTime = this.props.format24h ? 'HH:mm' : 'hh:mm A'
            return (
                <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => this._onEventTapped({ actualEvent: this.props.events[event.index], eventData: event })}
                    key={i}
                    style={[styles.event, style]}
                >
                    {this.props.renderEvent ? this.props.renderEvent(event) : (
                        <View>
                            <Text numberOfLines={1} style={styles.eventTitle}>{event.title || 'Event'}</Text>
                            {numberOfLines > 1
                                ? <Text
                                    numberOfLines={numberOfLines - 1}
                                    style={[styles.eventSummary]}
                                >
                                    {event.summary || ' '}
                                </Text>
                                : null}
                            {numberOfLines > 2
                                ? <Text style={styles.eventTimes} numberOfLines={1}>{moment(event.start).format(formatTime)} - {moment(event.end).format(formatTime)}</Text>
                                : null}
                        </View>
                    )}
                </TouchableOpacity>
            )
        })

        return (
            <View>
                <View style={{ marginLeft: LEFT_MARGIN }}>
                    {events}
                </View>
            </View>
        )
    }

    render() {
        const { styles } = this.props
        return (
            <ScrollView ref={ref => (this._scrollView = ref)}
                contentContainerStyle={[styles.contentStyle, { width: this.props.width, }]}
            >
                {this._renderLines()}
                {this._renderEvents()}
                {this.props.redlineVisible && this._renderRedLine()}
            </ScrollView>
        )
    }
}
