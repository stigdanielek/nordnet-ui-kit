import React from 'react';
import classnames from 'classnames';
import Icon from '../icon/icon';
import './tooltip.scss';

class Tooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hover: false,
      toggled: false,
    };
    this.toggleShow = this.toggleShow.bind(this);
    this.mouseEnter = this.mouseEnter.bind(this);
    this.mouseLeave = this.mouseLeave.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);

    this.checkPosition = {
      above: (rect) => (rect.top > 1),
      left: (rect) => (rect.left > 1 && this.checkPosition.below(rect) && this.checkPosition.above(rect)),
      right: (rect) => (((window.innerWidth || document.documentElement.clientWidth) - rect.right > 1) &&
        this.checkPosition.below(rect) && this.checkPosition.above(rect)),
      below: (rect) => ((window.innerHeight || document.documentElement.clientHeight) - rect.bottom > 1),
    };

    this.placement = props.placement;
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClick);
    const rect = this.container.getBoundingClientRect();
    console.log(rect);
    console.log(this.container);
    this.contentTop = (rect.height || 0) + 8;
    this.contentRight = (this.container.offsetWidth || 0) + 16;
    this.contentLeft = (this.container.offsetWidth || 0) + 16;
    console.log((this.container.offsetWidth));
    this.contentBottom = -(rect.height || 0) + 50;
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(nextState.hover === this.state.hover && nextState.toggled === this.state.toggled);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick);
  }

  getPlacement(el, placement = 'below') {
    console.log(el);
    console.log('parent', el.parentNode);
    const rect = el.parentNode.querySelector('.tooltip-popup').getBoundingClientRect();
    console.log({el});

    console.log('getPlacement:', placement, rect);
    console.log('1111111');


    // Try the position last used
    if (this.placement && this.checkPosition[this.placement](rect)) {
      return this.placement;
    }

    // Try the chosen position
    if (this.checkPosition[placement](rect)) {
      return placement;
    }
    console.log('222222');




    console.log('3333333');
    console.log('rect.top', rect.top);
    console.log('rect.bottom', rect.bottom);
    console.log((window.innerHeight || document.documentElement.clientHeight));

    // Try figure out a new position that will fit, otherwise use default
    if (this.checkPosition.below(rect)) {
      return 'below';
    } else if (this.checkPosition.above(rect)) {
      return 'above';
    } else if (this.checkPosition.right(rect)) {
      return 'right';
    } else if (this.checkPosition.left(rect)) {
      return 'left';
    }

    return 'below';
  }

  handleClick({ target } = {}) {
    if (target && this.onOutsideElement && !this.onOutsideElement.contains(target)) {
      this.handleClickOutside();
    }
  }

  handleClickOutside() {
    if (this.state.toggled) {
      this.setState({
        toggled: false,
      });
    }
  }

  toggleShow() {
    this.setState({
      toggled: !this.state.toggled,
      hover: false,
    });
  }

  mouseEnter() {
    if (!this.state.toggled || !this.state.hover) {
      this.setState({
        hover: true,
      });
    }
  }

  mouseLeave() {
    if (!this.state.toggled || this.state.hover) {
      this.setState({
        hover: false,
      });
    }
  }

  renderPopup(content, placement) {
    const style = {
      opacity: this.state.hover || this.state.toggled ? 1 : 0,
      pointerEvents: this.state.hover || this.state.toggled ? 'all' : 'none',
    };

    if (this.props.fixedWidth) {
      style.width = this.props.fixedWidth;
      style.whiteSpace = 'inherit';
    }

    console.log('placement', placement);
    switch (placement) {
      case 'below':
        style.top = this.contentTop;
        break;
      case 'right':
        style.left = this.contentRight;
        break;
      case 'left':
        style.right = this.contentLeft;
        break;
      case 'above':
      default:
        style.bottom = this.contentBottom;
        break;
    }

    return (
      <div
        style={ style }
        className={ `tooltip-popup tooltip-popup--${placement}` }
      >
        <div className="tooltip-popup__content">
          { content }
        </div>
      </div>
    );
  }

  render() {
    const { children, content, className, placement } = this.props;
    if (this.container && this.state.hover) {
      this.placement = this.getPlacement(this.container, placement);
    }

    return (
      <div className={ classnames('tooltip', className) } ref={ (element) => { this.onOutsideElement = element; } }>
        <div
          ref={ (container) => { this.container = container; } }
          className="tooltip-container"
          onClick={ this.toggleShow }
          onMouseEnter={ this.mouseEnter }
          onMouseLeave={ this.mouseLeave }
        >
          { children }
        </div>
        { this.renderPopup(content, this.placement) }
      </div>
    );
  }
}

Tooltip.defaultProps = {
  children: <Icon type="questionmark" fill="#00A9EC" stroke="#00A9EC" width={ 16 } height={ 16 } />,
  placement: 'below',
};

Tooltip.propTypes = {
  className: React.PropTypes.string,
  /** The content found in the tooltip */
  content: React.PropTypes.node,
  /** The container that, when clicked, will show the tooltip */
  children: React.PropTypes.node,
  placement: React.PropTypes.oneOf(['above', 'below', 'right', 'left']),
  fixedWidth: React.PropTypes.number,
};

export default Tooltip;