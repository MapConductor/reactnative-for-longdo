import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createGeoPoint, createMapCameraPosition } from '@mapconductor/js-sdk-core';
import { LongdoDesign } from '@mapconductor/react-for-longdo/state';
import { buildPackage } from './helpers/buildPackage.mjs';

// LongdoMapView は共有の NativeMapViewHost に「どのネイティブビューか」「デザインをどう文字列化するか」を
// 渡すだけの層。React を描画せず関数として呼び、返ってきた要素の props で受け渡しを確かめる。
// Longdo はデザインを id で渡す（getValue() の 'mapDesign_id=...,layer=...' ではない）。
const { mod, cleanup } = await buildPackage('mapview-tests');
after(cleanup);
const { LongdoMapView, LongdoViewState, LongdoViewController, NativeMapViewHost, ReactNativeBridgeMapViewController } = mod;

test('the shared native host is rendered with the LongdoMapView native view', () => {
  const element = LongdoMapView({ state: new LongdoViewState() });
  assert.equal(element.type, NativeMapViewHost);
  // Android の REACT_CLASS / iOS の RCT_EXPORT_MODULE と揃っていないと
  // 「View config not found」で落ちる名前。
  assert.deepEqual(element.props.nativeComponent, { nativeViewName: 'LongdoMapView' });
  // このプロバイダはネイティブ固有の prop（API キー等）を渡さない。
  assert.equal(element.props.nativeProps, undefined);
});

test('the design value sent to native follows the state design', () => {
  const state = new LongdoViewState();
  assert.equal(LongdoMapView({ state }).props.mapDesignValue, 'Normal');
  state.mapDesignType = LongdoDesign.Satellite;
  assert.equal(LongdoMapView({ state }).props.mapDesignValue, 'Satellite');
});

test('app props pass through to the host untouched', () => {
  const state = new LongdoViewState();
  const onMapClick = () => {};
  const props = LongdoMapView({ state, onMapClick, children: 'child' }).props;
  assert.equal(props.state, state);
  assert.equal(props.onMapClick, onMapClick);
  assert.equal(props.children, 'child');
});

test('createController builds a LongdoViewController bound to the native ref and initial camera', () => {
  const view = { nodeHandle: 7 };
  const camera = createMapCameraPosition({ position: createGeoPoint({ latitude: 35.68, longitude: 139.76 }), zoom: 12 });
  const controller = LongdoMapView({ state: new LongdoViewState() }).props.createController({ current: view }, camera);
  assert.ok(controller instanceof LongdoViewController);
  assert.ok(controller instanceof ReactNativeBridgeMapViewController);
  assert.equal(controller.getCameraPosition(), camera);
  assert.equal(controller.holder.mapView, view);
  controller.destroy();
});

test('the id is sent, not the composite getValue() string', () => {
  const design = LongdoDesign.Normal;
  const value = LongdoMapView({ state: new LongdoViewState({ mapDesignType: design }) }).props.mapDesignValue;
  assert.equal(value, design.id);
  assert.notEqual(value, design.getValue());
});
