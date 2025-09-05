using Core.Helpers;
using Dapper;
using Entities.Enums;
using Entities.Models;
using Entities.ViewModels.Products;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Services.Helpers;
using System.Data;

namespace Services.Dapper
{
    public abstract class MainService
    {
        private readonly IConfiguration _config;
        protected readonly ErrorLoggingService errorLogger;

        protected string ConnectionString { get; }

        public MainService(IConfiguration config, ErrorLoggingService errorLogger)
        {
            _config = config;
            ConnectionString = _config.GetConnectionString("DefaultConnection");
            this.errorLogger = errorLogger;
        }


        protected IDbConnection Connection => new SqlConnection(ConnectionString);
        protected async Task<DynamicParameters> ConstructParametersAsync<T>(string storedProcedureName, object input)
        {
            int? id = DapperPropertiesHelper.GetIdFromObject(input);

            T entity = id > 0 ?
                await GetByAsync<T>(storedProcedureName, new { Id = id, StatementType = "GetById" }) :
                Activator.CreateInstance<T>();

            if (entity == null)
            {
                throw new InvalidOperationException($"Failed to retrieve or instantiate entity of type {typeof(T).Name}. ID: {id}");
            }

            var updateMethod = entity.GetType().GetMethod("Update");

            if (updateMethod != null)
            {
                try
                {
                    updateMethod.Invoke(entity, new object[] { input });
                }
                catch (Exception ex)
                {
                    throw new InvalidOperationException($"Failed to apply the Update method on the entity of type {typeof(T).Name}.", ex);
                }
            }
            else
            {
                throw new InvalidOperationException($"The type {typeof(T).Name} does not have an 'Update' method.");
            }

            var param = await Task.Run(() => DapperPropertiesHelper.SkipAttributes(entity));
            param.Add("newId", dbType: DbType.Int32, size: 50, direction: ParameterDirection.Output);

            return param;
        }

        public async Task<OperationResult> CRUD<T>(string Storename, object parameters, ActionEnum action, bool AutoFindParams)
        {
            var param = new DynamicParameters();

            if (AutoFindParams)
                param = await ConstructParametersAsync<T>(Storename, parameters);
            else
                param.AddDynamicParams(parameters);

            return await CRUDPost(Storename, param, action);
        }

        protected async Task<OperationResult> CRUDPost(string storedProcedureName, dynamic parameters, ActionEnum action)
        {
            var param = parameters is DynamicParameters ? parameters as DynamicParameters : new DynamicParameters();

            if (parameters is not DynamicParameters)
                param.AddDynamicParams(parameters);

            var model = new { StatementType = action.GetDisplayName() };
            param.AddDynamicParams(model);

            if (action.Equals(ActionEnum.Create))
            {
                param.Add("Id", 0);
                param.Add("newId", dbType: DbType.Int32, size: 50, direction: ParameterDirection.Output);
            }
            if (action.Equals(ActionEnum.Update))
            {
                param.Add("newId", dbType: DbType.Int32, size: 50, direction: ParameterDirection.Output);
            }

            try
            {
                using var connection = new SqlConnection(ConnectionString);
                await connection.OpenAsync().ConfigureAwait(false);

                var result = await connection.ExecuteAsync(storedProcedureName, param, commandType: CommandType.StoredProcedure)
                    .ConfigureAwait(false);

                OperationResult oResult = OperationResult.SuccessResult($"Object in {storedProcedureName} was {action.GetDisplayName()} successfully.");

                if (action.Equals(ActionEnum.Create) || action.Equals(ActionEnum.Update))
                {
                    int? iD = param.Get<int?>("newId");
                    oResult.Id = iD;
                }

                return oResult;
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(CRUDPost), nameof(MainService));
                return OperationResult.FailureResult(ex.Message);
            }
        }

        protected async Task<IAsyncEnumerable<T>> GetAll<T>(string storedProcedureName, object parameters)
        {
            var param = new DynamicParameters();
            param.AddDynamicParams(parameters);

            using var connection = new SqlConnection(ConnectionString);
            await connection.OpenAsync().ConfigureAwait(false);

            try
            {
                if (typeof(T) == typeof(ProductVW))
                {
                    using (var result = await connection.QueryMultipleAsync(storedProcedureName, param, commandType: CommandType.StoredProcedure)
                       .ConfigureAwait(false))
                    {
                        var products = await result.ReadAsync<ProductVW>().ConfigureAwait(false);
                        var images = await result.ReadAsync<Images>().ConfigureAwait(false);
                        // Uncomment if variants and reviews are needed
                        // var variants = await result.ReadAsync<VariantSqlOutput>().ConfigureAwait(false);
                        // var reviews = await result.ReadAsync<Review>().ConfigureAwait(false);

                        if (products != null)
                        {
                            foreach (var product in products)
                            {
                                product.Images = images.Where(v => v.ProductId == product.Id).ToList();
                                // Uncomment if variants and reviews are needed
                                // product.Variants = variants.Where(v => v.ProductId == product.Id).ToList();
                                // product.Reviews = reviews.Where(v => v.ProductId == product.Id).ToList();
                            }

                            return (IAsyncEnumerable<T>)products.ToAsyncEnumerable();
                        }

                        return Enumerable.Empty<T>().ToAsyncEnumerable();
                    }
                }
                else
                {

                    var result = await connection.QueryAsync<T>(storedProcedureName, param, commandType: CommandType.StoredProcedure)
                    .ConfigureAwait(false);

                    return result?.ToAsyncEnumerable() ?? Enumerable.Empty<T>().ToAsyncEnumerable();
                }
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(GetAll), nameof(MainService));
                return Enumerable.Empty<T>().ToAsyncEnumerable(); // Return an empty collection on error
            }
        }

        protected async Task<List<object>> GetAllMultiple(string storedProcedureName, object parameters, Type[] entityTypes)
        {
            var param = new DynamicParameters();
            param.AddDynamicParams(parameters);

            try
            {
                using var connection = new SqlConnection(ConnectionString);
                await connection.OpenAsync().ConfigureAwait(false);

                using (var result = await connection.QueryMultipleAsync(storedProcedureName, param, commandType: CommandType.StoredProcedure))
                {
                    var entitiesList = new List<object>();

                    foreach (var entityType in entityTypes)
                    {
                        var entities = await result.ReadAsync(entityType);
                        entitiesList.AddRange(entities);
                    }

                    return entitiesList;
                }
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(GetAllMultiple), nameof(MainService));
                return null;
            }
        }

        protected async Task<T> GetByAsync<T>(string storedProcedureName, object parameters)
        {
            try
            {
                using var connection = new SqlConnection(ConnectionString);
                await connection.OpenAsync().ConfigureAwait(false);

                var result = await connection.QueryFirstOrDefaultAsync<T>(storedProcedureName, parameters, commandType: CommandType.StoredProcedure)
                    .ConfigureAwait(false);

                return result;
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(GetByAsync), nameof(MainService));
                return default;
            }
        }

        protected async Task<int> GetCountBy(string storedProcedureName, object parameters)
        {
            try
            {
                using var connection = new SqlConnection(ConnectionString);
                await connection.OpenAsync().ConfigureAwait(false);

                var result = await connection.ExecuteScalarAsync<int>(storedProcedureName, parameters, commandType: CommandType.StoredProcedure)
                    .ConfigureAwait(false);

                return result;
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(GetCountBy), nameof(MainService));
                return default;
            }
        }

        protected async Task<bool> CheckIfExistsAsync(string storedProcedureName, object parameters)
        {
            using var connection = new SqlConnection(ConnectionString);
            try
            {
                await connection.OpenAsync().ConfigureAwait(false);
                // Assuming the stored procedure always returns an integer (0 or 1)
                var result = await connection.QueryFirstOrDefaultAsync<int>(storedProcedureName, parameters, commandType: CommandType.StoredProcedure)
                            .ConfigureAwait(false);
                return result == 1; // True if the stored procedure returned 1, false otherwise
            }
            catch (Exception ex)
            {
                errorLogger.LogException(ex, nameof(CheckIfExistsAsync), nameof(MainService));
                return false;
            }
        }

        protected async Task<IEnumerable<T>> SafeReadAsync<T>(SqlMapper.GridReader multi)
        {
            try
            {
                return await multi.ReadAsync<T>().ConfigureAwait(false);
            }
            catch
            {
                return Enumerable.Empty<T>();
            }
        }

        protected async Task<T> SafeReadSingleOrDefaultAsync<T>(SqlMapper.GridReader multi)
        {
            try
            {
                return await multi.ReadSingleOrDefaultAsync<T>().ConfigureAwait(false);
            }
            catch
            {
                return default;
            }
        }

    }
}
