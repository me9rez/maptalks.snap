/*!
 * maptalks.snap v0.4.4
  */
import { Class, Coordinate, Eventable, Extent, LineString, Marker, Point, Polygon, Util } from "maptalks";
const src_options = {
    tolerance: 15,
    filterGeometries: null
};
const TEMP_POINT = new Point(0, 0);
function coordinateToContainerPoint(coordinate, map, out) {
    return map.coordToContainerPoint(coordinate, null, out);
}
const TEMP_LINE = [
    [
        0,
        0
    ],
    [
        0,
        0
    ]
], TEMP_MOUSEPOINT = [
    0,
    0
];
function getShortestPointInLine(line, p) {
    const p1 = line[0];
    const p2 = line[1];
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const cross = dx * (p[0] - p1[0]) + dy * (p[1] - p1[1]);
    if (cross <= 0) {
        TEMP_POINT.x = p1[0];
        TEMP_POINT.y = p1[1];
        return TEMP_POINT;
    }
    const d2 = dx * dx + dy * dy;
    if (cross >= d2) {
        TEMP_POINT.x = p2[0];
        TEMP_POINT.y = p2[1];
        return TEMP_POINT;
    }
    const u = cross / d2;
    TEMP_POINT.x = p1[0] + u * dx;
    TEMP_POINT.y = p1[1] + u * dy;
    return TEMP_POINT;
}
const TEMP_POINT1 = new Point(0, 0), TEMP_POINT2 = new Point(0, 0), TEMP_POINT3 = new Point(0, 0), TEMP_POINT4 = new Point(0, 0), TEMP_EXTENT = new Extent(0, 0, 0, 0), TEMP_COORDINATE = new Coordinate(0, 0);
function ringBBOX(ring, map, tolerance) {
    let minx = 1 / 0, miny = 1 / 0, maxx = -1 / 0, maxy = -1 / 0;
    for(let i = 0, len = ring.length; i < len; i++){
        const { x, y } = ring[i];
        minx = Math.min(x, minx);
        miny = Math.min(y, miny);
        maxx = Math.max(x, maxx);
        maxy = Math.max(y, maxy);
    }
    TEMP_COORDINATE.x = minx;
    TEMP_COORDINATE.y = miny;
    const p1 = coordinateToContainerPoint(TEMP_COORDINATE, map, TEMP_POINT1);
    TEMP_COORDINATE.x = minx;
    TEMP_COORDINATE.y = maxy;
    const p2 = coordinateToContainerPoint(TEMP_COORDINATE, map, TEMP_POINT2);
    TEMP_COORDINATE.x = maxx;
    TEMP_COORDINATE.y = maxy;
    const p3 = coordinateToContainerPoint(TEMP_COORDINATE, map, TEMP_POINT3);
    TEMP_COORDINATE.x = maxx;
    TEMP_COORDINATE.y = miny;
    const p4 = coordinateToContainerPoint(TEMP_COORDINATE, map, TEMP_POINT4);
    TEMP_EXTENT.xmin = Math.min(p1.x, p2.x, p3.x, p4.x) - tolerance;
    TEMP_EXTENT.ymin = Math.min(p1.y, p2.y, p3.y, p4.y) - tolerance;
    TEMP_EXTENT.xmax = Math.max(p1.x, p2.x, p3.x, p4.x) + tolerance;
    TEMP_EXTENT.ymax = Math.max(p1.y, p2.y, p3.y, p4.y) + tolerance;
    return TEMP_EXTENT;
}
function pointOnLine(point, startPoint, endPoint) {
    const x = point.x;
    const y = point.y;
    const x1 = startPoint.x;
    const y1 = startPoint.y;
    const x2 = endPoint.x;
    const y2 = endPoint.y;
    const dxc = x - x1;
    const dyc = y - y1;
    const dxl = x2 - x1;
    const dyl = y2 - y1;
    const cross = dxc * dyl - dyc * dxl;
    if (Math.abs(cross) > 0.1) return;
    if (Math.abs(dxl) >= Math.abs(dyl)) {
        if (dxl > 0 ? x1 < x && x < x2 : x2 < x && x < x1) return true;
    } else if (dyl > 0 ? y1 < y && y < y2 : y2 < y && y < y1) return true;
}
function pointOnRing(ring, point) {
    if (!point) return;
    if (point.x === ring[0].x && point.y === ring[0].y) return [
        0,
        1
    ];
    for(let i = 0; i < ring.length - 1; i++){
        if (point.x === ring[i + 1].x && point.y === ring[i + 1].y) return [
            i + 1,
            i + 2
        ];
        if (pointOnLine(point, ring[i], ring[i + 1])) return [
            i + 1,
            i + 1
        ];
    }
}
class Snap extends Eventable(Class) {
    map;
    _mousePoint;
    _geometries;
    constructor(map, options){
        super(options);
        this.map = map;
        this._mousePoint = null;
        this._geometries = [];
        this.map.on('mousemove', this._mouseMove, this);
    }
    _mouseMove(e) {
        this._mousePoint = e.containerPoint;
        return this;
    }
    _validateMousePosition(point) {
        return this._mousePoint && this._mousePoint.distanceTo(point) <= this.options.tolerance + 5;
    }
    effectGeometry(geometry) {
        if (this._geometries.indexOf(geometry) > -1) return this;
        this._geometries.push(geometry);
        const self = this;
        const snapTo = (handleConatainerPoint, lastContainerPoints)=>{
            if (!handleConatainerPoint) return;
            let geometries;
            const filterGeometries = self.options.filterGeometries || self.options.fiterGeometries;
            if (filterGeometries && Util.isFunction(filterGeometries)) geometries = filterGeometries();
            if (!geometries || !geometries.length) {
                const layer = this.getLayer();
                if (layer) geometries = layer.getGeometries();
            }
            return self._nearest(geometries, handleConatainerPoint, this, lastContainerPoints);
        };
        geometry.snapTo = snapTo;
        if (geometry.getGeometries) {
            const children = geometry.getGeometries();
            children.forEach((child)=>{
                child.snapTo = snapTo;
            });
        }
        return this;
    }
    unEffectGeometry(geometry) {
        const index = this._geometries.indexOf(geometry);
        if (-1 === index) return this;
        this._geometries.splice(index, 1);
        delete geometry.snapTo;
        if (geometry.getGeometries) {
            const children = geometry.getGeometries();
            children.forEach((child)=>{
                delete child.snapTo;
            });
        }
        return this;
    }
    dispose() {
        this._geometries.forEach((geometry)=>{
            this.unEffectGeometry(geometry);
        });
        this.map.off('mousemove', this._mouseMove, this);
        delete this.map;
        delete this._mousePoint;
        delete this._geometries;
    }
    _nearest(geometries, handleConatainerPoint, currentGeometry, lastContainerPoints) {
        let point;
        for(let i = 0, len = geometries.length; i < len; i++){
            const geometry = geometries[i];
            if (geometry) {
                if (geometry !== currentGeometry && (!currentGeometry || !currentGeometry._parent || currentGeometry._parent !== geometry)) if (lastContainerPoints && lastContainerPoints.length) {
                    const nearestGeometry = this._nearestGeometry(geometries[i], handleConatainerPoint, lastContainerPoints);
                    if (nearestGeometry) {
                        if (nearestGeometry.effectedVertex) {
                            point = nearestGeometry;
                            break;
                        } else if (!point) point = nearestGeometry;
                    }
                } else {
                    point = this._nearestGeometry(geometries[i], handleConatainerPoint, lastContainerPoints);
                    if (point) break;
                }
            }
        }
        if (point) return point;
        return this._mousePoint && this._mousePoint.copy();
    }
    _fireSnapEvent(point, geometry) {
        point = point.point || point;
        this.fire('snap', {
            containerPoint: point.copy(),
            geometry,
            coordinate: this.map.containerPointToCoord(point)
        });
        return this;
    }
    _nearestGeometry(geometry, handleConatainerPoint, lastContainerPoints) {
        if (geometry.getGeometries) {
            const geometries = geometry.getGeometries();
            for(let i = 0, len = geometries.length; i < len; i++){
                const point = this._nearestGeometry(geometries[i], handleConatainerPoint, lastContainerPoints);
                if (point) {
                    this._fireSnapEvent(point, geometry);
                    return point;
                }
            }
            return;
        }
        const tolerance = Math.max(this.options.tolerance, 1);
        const coordinates = geometry.getCoordinates();
        const map = this.map;
        const isNearest = (point)=>handleConatainerPoint.distanceTo(point) <= tolerance && this._validateMousePosition(point);
        if (geometry instanceof Marker) {
            const point = coordinateToContainerPoint(coordinates, this.map, TEMP_POINT);
            if (isNearest(point)) {
                this._fireSnapEvent(point, geometry);
                return point.copy();
            }
            return;
        }
        const nearestRing = (ring)=>{
            if (!ring || ring.length < 2) return;
            const bbox = ringBBOX(ring, map, tolerance);
            const x = handleConatainerPoint.x, y = handleConatainerPoint.y;
            if (x < bbox.xmin || y < bbox.ymin || x > bbox.xmax || y > bbox.ymax) return;
            const len = ring.length;
            let i = 0;
            let POINT;
            for(; i < len - 1; i++){
                const coordinate = ring[i];
                const point = POINT || coordinateToContainerPoint(coordinate, map, TEMP_POINT);
                if (!POINT && isNearest(point)) return point.copy();
                const coordinate1 = ring[i + 1];
                const point1 = coordinateToContainerPoint(coordinate1, map, TEMP_POINT1);
                if (isNearest(point1)) return point1.copy();
                TEMP_LINE[0][0] = point.x;
                TEMP_LINE[0][1] = point.y;
                TEMP_LINE[1][0] = point1.x;
                TEMP_LINE[1][1] = point1.y;
                TEMP_MOUSEPOINT[0] = handleConatainerPoint.x;
                TEMP_MOUSEPOINT[1] = handleConatainerPoint.y;
                const linePoint = getShortestPointInLine(TEMP_LINE, TEMP_MOUSEPOINT);
                if (isNearest(linePoint)) return linePoint.copy();
                POINT = TEMP_POINT2;
                POINT.x = point1.x;
                POINT.y = point1.y;
            }
        };
        const getEffectedVertexOnRing = (ring, oldPoints, newPoint, isRing)=>{
            const [oldPoint, beforeOldPoint] = oldPoints;
            const ringPoints = ring.map((point)=>coordinateToContainerPoint(point, map));
            const oldIndex = pointOnRing(ringPoints, oldPoint);
            if (!oldIndex) return;
            const newIndex = pointOnRing(ringPoints, newPoint);
            if (!newIndex) return void console.log('seems something wrong');
            if (oldIndex[0] === newIndex[0] && oldIndex[1] === newIndex[1]) return;
            if (isRing) {
                let reverse = false;
                const beforeOldIndex = pointOnRing(ringPoints, beforeOldPoint);
                if (beforeOldIndex) {
                    if (beforeOldIndex[0] > oldIndex[0] || beforeOldIndex[1] > oldIndex[1]) reverse = true;
                    else if (beforeOldIndex[0] === oldIndex[0] && beforeOldIndex[1] === oldIndex[1] && pointOnLine(beforeOldPoint, oldPoint, ringPoints[oldIndex[0]])) reverse = true;
                }
                if (oldIndex[0] < newIndex[0] || oldIndex[1] < newIndex[1]) if (reverse) return ringPoints.slice(1, oldIndex[1]).reverse().concat(ringPoints.slice(newIndex[1]).reverse());
                else return ringPoints.slice(oldIndex[1], newIndex[0]);
                if (reverse) return ringPoints.slice(newIndex[1], oldIndex[0]).reverse();
                return ringPoints.slice(oldIndex[1]).concat(ringPoints.slice(1, newIndex[1]));
            }
            if (oldIndex[0] < newIndex[0] || oldIndex[1] < newIndex[1]) return ringPoints.slice(oldIndex[1], newIndex[0]);
            return ringPoints.slice(newIndex[1], oldIndex[0]).reverse();
        };
        if (geometry instanceof LineString) {
            const point = nearestRing(coordinates);
            if (point) {
                if (lastContainerPoints && lastContainerPoints.length) {
                    const effectedVertex = getEffectedVertexOnRing(coordinates, lastContainerPoints, point);
                    if (effectedVertex && effectedVertex.length) {
                        this._fireSnapEvent(point, geometry);
                        return {
                            point: point.copy(),
                            effectedVertex
                        };
                    }
                }
                this._fireSnapEvent(point, geometry);
                return point.copy();
            }
            return;
        }
        if (geometry instanceof Polygon) for(let i = 0, len = coordinates.length; i < len; i++){
            const point = nearestRing(coordinates[i]);
            if (point) {
                if (lastContainerPoints && lastContainerPoints.length) {
                    const effectedVertex = getEffectedVertexOnRing(coordinates[i], lastContainerPoints, point, true);
                    if (effectedVertex && effectedVertex.length) {
                        this._fireSnapEvent(point, geometry);
                        return {
                            point: point.copy(),
                            effectedVertex
                        };
                    }
                }
                this._fireSnapEvent(point, geometry);
                return point.copy();
            }
        }
    }
    _sortGeometries(geometries, handleConatainerPoint) {
        const map = this.map;
        geometries.forEach((geo)=>{
            const center = geo.getCenter();
            if (!center) return;
            const containerPoint = coordinateToContainerPoint(center, map);
            geo._distance = handleConatainerPoint.distanceTo(containerPoint);
        });
        return geometries.sort((geo1, geo2)=>geo1._distance - geo2._distance);
    }
}
Snap.mergeOptions(src_options);
export { Snap };
