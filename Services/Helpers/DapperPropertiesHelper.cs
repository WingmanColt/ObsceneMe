using Dapper;
using System.Collections;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using System.Reflection;

namespace Services.Helpers
{
    public static class DapperPropertiesHelper
    {
        public static DynamicParameters SkipAttributes(object Model)
        {
            var parameters = new DynamicParameters();
            var prop = Model?.GetType().GetProperties();
            int propCount = prop.Length;
            dynamic propValue;

            for (int i = 0; i < propCount; i++)
            {
                propValue = GetPropValue(Model, prop[i].Name);
                if (propValue is int ? (Int32.TryParse(propValue.ToString(), out int number) && number > 0) : propValue is not null)
                {
                    if(!HasAttribute(prop[i], "NotMapped"))
                    {
                        parameters.Add(prop[i].Name, propValue/*, GetPropertyType(prop[i].PropertyType.Name)*/);
                    }
                }
            }


            return parameters;
        }
        public static DynamicParameters SkipAttributes(object model, bool skipNulls)
        {
            var parameters = new DynamicParameters();
            var properties = model?.GetType().GetProperties();

            foreach (var property in properties)
            {
                // Check if property is IEnumerable (but not string), ICollection, or IList, then skip
                if (typeof(IEnumerable).IsAssignableFrom(property.PropertyType) && property.PropertyType != typeof(string)
                    || typeof(ICollection).IsAssignableFrom(property.PropertyType)
                    || typeof(IQueryable).IsAssignableFrom(property.PropertyType)
                    || typeof(IList).IsAssignableFrom(property.PropertyType))
                    continue;

                // Skip properties with the NotMapped attribute
                if (HasAttribute(property, typeof(NotMappedAttribute)))
                    continue;

                var propValue = property.GetValue(model);

                if (propValue == null && skipNulls)
                    continue;

                if (property.PropertyType == typeof(int) || property.PropertyType == typeof(int?))
                {
                    if (int.TryParse(propValue?.ToString(), out int intValue) && intValue > 0)
                        parameters.Add(property.Name, intValue);
                }
                else if (property.PropertyType == typeof(double) || property.PropertyType == typeof(double?))
                {
                    if (double.TryParse(propValue?.ToString(), out double doubleValue) && doubleValue > 0.0)
                        parameters.Add(property.Name, doubleValue);
                }
                else if (property.PropertyType.IsEnum)
                {
                    if (propValue != null && (int)propValue != 0)
                        parameters.Add(property.Name, propValue);
                }
                else if (propValue is string str && !string.IsNullOrEmpty(str))
                {
                    parameters.Add(property.Name, propValue);
                }
                else if (!skipNulls)
                {
                    parameters.Add(property.Name, propValue);
                }
            }

            return parameters;
        }

        public static DbType GetPropertyType(string name)
        {
            switch (name)
            {
                case "String": return DbType.String;
                case "Int32": return DbType.Int32;
                case "DateTime": return DbType.DateTime;
                case "Object": return DbType.Object;
                case "Boolean": return DbType.Boolean;
                default: return DbType.Object;
            }

        }

        private static bool HasAttribute(PropertyInfo propertyInfo, Type attributeType)
        {
            return Attribute.IsDefined(propertyInfo, attributeType);
        }
        public static object GetPropValue(object src, string propName)
        {
            return src.GetType().GetProperty(propName).GetValue(src, null);
        }

        public static bool HasAttribute(this PropertyInfo target, string atrName)
        {
            var attribs = target.GetCustomAttributesData().Any(x => x.AttributeType.Name == atrName + "Attribute");
            return attribs;
        }

        public static int? GetIdFromObject(object parameters)
        {
            var type = parameters.GetType();
            var idProp = type.GetProperty("Id");

            if (idProp != null)
            {
                return (int)idProp.GetValue(parameters, null);
            }

            return null;
        }
    }
    
}
