import * as maptalks from 'maptalks';
declare const Snap_base: (new (...args: any[]) => {
    _eventMap?: Record<string, maptalks.HandlerContext[]>;
    _eventParent?: any;
    _eventTarget?: any;
    on(eventsOn: string | maptalks.EventRecords, handler: maptalks.HandlerFn, context?: any): any;
    addEventListener(...args: any[]): any;
    once(eventTypes: string | maptalks.EventRecords, handler: maptalks.HandlerFn, context?: any): any;
    off(eventsOff: string | maptalks.EventRecords, handler: maptalks.HandlerFn, context?: any): any;
    removeEventListener(...args: any[]): any;
    listens(eventType: string, handler?: maptalks.HandlerFn, context?: any): number;
    getListeningEvents(): string[];
    copyEventListeners(target: any): any;
    fire(eventType: string, param?: maptalks.BaseEventParamsType): any;
    _wrapOnceHandler(evtType: string, handler: maptalks.HandlerFn, context?: any): (...args: any[]) => void;
    _switch(to: string, eventRecords: maptalks.EventRecords, context?: any): any;
    _clearListeners(eventType: string): void;
    _clearAllListeners(): void;
    _setEventParent(parent: any): any;
    _setEventTarget(target: any): any;
    _fire(eventType: string, param: maptalks.BaseEventParamsType): any;
}) & typeof maptalks.Class;
export declare class Snap extends Snap_base {
    map: any;
    _mousePoint: any;
    _geometries: any;
    constructor(map: any, options: any);
    _mouseMove(e: any): this;
    _validateMousePosition(point: any): any;
    effectGeometry(geometry: any): this;
    unEffectGeometry(geometry: any): this;
    dispose(): void;
    _nearest(geometries: any, handleConatainerPoint: any, currentGeometry: any, lastContainerPoints: any): any;
    _fireSnapEvent(point: any, geometry: any): this;
    _nearestGeometry(geometry: any, handleConatainerPoint: any, lastContainerPoints: any): any;
    _sortGeometries(geometries: any, handleConatainerPoint: any): any;
}
export {};
