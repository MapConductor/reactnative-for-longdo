module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: './android',
        packageImportPath:
          'import com.mapconductor.react.longdo.MapConductorLongdoPackage;',
        packageInstance: 'new MapConductorLongdoPackage()',
      },
      ios: {
        sourceDir: './ios',
      },
    },
  },
};
