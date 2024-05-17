
import React, { Component, useEffect } from "react";
import { connect } from "react-redux";
import "./App.css";
import { VariableSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import AutoSizer from "react-virtualized-auto-sizer";
import { WindowScroller } from "react-virtualized";

const ITEM_HEIGHT = 200;

const ItemDisplay = React.forwardRef(({ title, description, img, index }, ref) => {

  return (
    <div ref={ref} className="item">
      <h6>#{index} {title}</h6>
      {img && <img src={img} alt={title} />}
      <p>{description}</p>
    </div>
  );
});

const RowItem = React.memo(function RowItem({
  title,
  description,
  img,
  id,
  rowIndex,
  setRowSize,
  windowWidth
}) {
  const itemRef = React.useRef();

  useEffect(() => {
    setRowSize(rowIndex, itemRef.current.getBoundingClientRect().height);
  }, [windowWidth]);

  return (
    <div ref={itemRef} className="list-item">
      <ItemDisplay title={title} description={description} img={img} index={rowIndex} />
    </div>
  );
});

class App extends Component {
  infiniteLoaderRef = React.createRef();
  listRef = React.createRef();
  maxWidth = 0;

  rowSizeMap = {};

  setRowSize = (index, size) => {
    if (this.rowSizeMap[index]) {
      if (this.rowSizeMap[index] < size) {
        this.rowSizeMap[index] = size;
        this.listRef.current.resetAfterIndex(index);
      }
    } else {
      this.rowSizeMap[index] = size;
      this.listRef.current.resetAfterIndex(index);
    }
  };

  componentDidMount() {
    this.props.loadMore();
  }

  loadNextPage = () => {
    if (!this.props.isFetching) {
      this.props.loadMore();
    }
  };

  getRowHeight = index => {
    return this.rowSizeMap[index] || ITEM_HEIGHT;
  };

  //hack to use react virtualized window scroller with react window
  handleScroll = (event) => {
    console.log(event);
  };

  render() {
    const { items } = this.props;

    return (
      <div className="App">
        <h1>Virtualized List</h1>
        <div className="list-container">
          <AutoSizer>
            {({ height, width }) => {
              this.maxWidth = width;
              const rowCount = items.length + 1;

              const rowRenderer = ({ index, style }) => {
                const { items } = this.props;
                const item = items[index];

                const newStyle = { ...style };
                return (
                  <div style={newStyle} className={"list-row"}>
                    {item && (
                      <RowItem
                        windowWidth={width}
                        rowIndex={index}
                        setRowSize={this.setRowSize}
                        img={item.img}
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        description={item.description}
                      />
                    )}
                  </div>
                );
              };

              return (
                <InfiniteLoader
                  threshold={5}
                  isItemLoaded={index => !!items[index]}
                  itemCount={rowCount}
                  loadMoreItems={this.loadNextPage}
                >
                  {({ onItemsRendered, ref }) => {
                    return (
                      <List
                        className="list-view"
                        ref={this.listRef}
                        height={height}
                        itemCount={rowCount}
                        estimatedItemSize={ITEM_HEIGHT}
                        itemSize={this.getRowHeight}
                        onItemsRendered={onItemsRendered}
                        width={width}
                        onScroll={this.handleScroll}
                      >
                        {rowRenderer}
                      </List>
                    );
                  }}
                </InfiniteLoader>
              );
            }}
          </AutoSizer>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    items: state.items,
    isFetching: state.isFetching,
    isReverse: true
  };
};

const mapDispatchToProps = dispatch => ({
  loadMore: () =>
    dispatch({
      type: "LOAD_MORE"
    })
});

export default connect(mapStateToProps, mapDispatchToProps)(App);