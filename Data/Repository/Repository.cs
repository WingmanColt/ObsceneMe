using Core.Helpers;
using Data;
using Entities.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;

namespace HireMe.Data.Repository
{
    public interface IRepository<TEntity> : IDisposable where TEntity : class
    {
        Task<bool> ExistsAsync(Expression<Func<TEntity, bool>> predicate);
        Task<TEntity?> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate);
        Task<TEntity> AddAsync(TEntity entity);
        Task AddRangeAsync(IQueryable<TEntity> entities);
        IQueryable<TEntity> DeleteRange(IQueryable<TEntity> entities);
        Task<TEntity> GetByIdAsync(int id);
        Task<OperationResult> SaveChangesAsync();
        IQueryable<TEntity> Set();
        IQueryable<TEntity> GetAll(Expression<Func<TEntity, bool>>? filter = null);
        Task<TEntity> UpdateAsync(TEntity entity);

        //    Task<bool> ExistsAsync(Expression<Func<TEntity, bool>> filter);
        //    Task<TEntity> AddAsync(TEntity entity);
        //  Task<TEntity> AddAsync(TEntity entity, CancellationToken cancellationToken);
          TEntity Delete(TEntity entity);

        //  Task<OperationResult> SaveChangesAsync(CancellationToken cancellationToken);
        //   Task<List<TEntity>> GetAllAsync(Expression<Func<TEntity, bool>>? filter = null,
        //      CancellationToken cancellationToken = default);
        //   Task<List<TEntity>> GetAllAsync(Expression<Func<TEntity, bool>>? filter = null);

        //  Task<OperationResult> UpdateAsync(TEntity entity);
        //   Task UpdateRangeAsync(IQueryable<TEntity> entities);
    }

    public class Repository<TEntity> : IRepository<TEntity> where TEntity : class
    {
        private readonly ApplicationDbContext _context;
        private readonly DbSet<TEntity> _dbSet;
        private bool _disposed = false; // Flag to track if the object has been disposed

        public Repository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _dbSet = _context.Set<TEntity>();
        }
        public async Task<TEntity?> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate)
        {
            return await _dbSet.FirstOrDefaultAsync(predicate);
        }

        public async Task<bool> ExistsAsync(Expression<Func<TEntity, bool>> predicate)
        {
            return await _dbSet.AnyAsync(predicate);
        }
        public async Task<TEntity> AddAsync(TEntity entity)
        {
            ValidateEntity(entity);
            await _dbSet.AddAsync(entity);
            return entity;
        }
        public async Task AddRangeAsync(IQueryable<TEntity> entities)
        {
            ValidateEntities(entities);
            await _dbSet.AddRangeAsync(entities);
        }

        public IQueryable<TEntity> Set()
        {
            return _dbSet;
        }

        public IQueryable<TEntity> GetAll(Expression<Func<TEntity, bool>>? filter = null)
        {
            IQueryable<TEntity> query = _dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }

            return query;
        }
        public IQueryable<TEntity> DeleteRange(IQueryable<TEntity> entities)
        {
            ValidateEntities(entities);
            _dbSet.RemoveRange(entities);
            return entities;
        }
        public TEntity Delete(TEntity entity)
        {
            ValidateEntity(entity);
            _dbSet.Remove(entity);
            return entity;
        }
        public async Task<TEntity> UpdateAsync(TEntity entity)
        {
            ValidateEntity(entity);
            AttachIfDetached(entity);
            _context.Entry(entity).State = EntityState.Modified;

            await Task.CompletedTask; // Keeps async signature consistent
            return entity;
        }


        public async Task<TEntity> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public async Task<OperationResult> SaveChangesAsync()
        {
            return await SaveChangesInternalAsync(CancellationToken.None);
        }

        /*


        // checks by all props
        public async Task<bool> ExistsAsync(Expression<Func<TEntity, bool>> filter)
        {
            return await _dbSet.AnyAsync(filter);
        }
        public async Task<TEntity> AddAsync(TEntity entity)
        {
            ValidateEntity(entity);
            await _dbSet.AddAsync(entity);
            return entity;
        }

        public async Task<TEntity> AddAsync(TEntity entity, CancellationToken cancellationToken)
        {
            ValidateEntity(entity);
            await _dbSet.AddAsync(entity, cancellationToken);
            return entity;
        }
        public async Task<List<TEntity>> GetAllAsync(Expression<Func<TEntity, bool>>? filter = null,
            CancellationToken cancellationToken = default)
        {
            IQueryable<TEntity> query = _dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }

            return await query.ToListAsync(cancellationToken);
        }

        public async Task<List<TEntity>> GetAllAsync(Expression<Func<TEntity, bool>>? filter = null)
        {
            IQueryable<TEntity> query = _dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }

            return await query.ToListAsync();
        }
       
        public TEntity Delete(TEntity entity)
        {
            ValidateEntity(entity);
            _dbSet.Remove(entity);
            return entity;
        }

        public async Task UpdateRangeAsync(IQueryable<TEntity> entities)
        {
            ValidateEntities(entities);
            foreach (var entity in entities)
            {
                AttachIfDetached(entity);
                _context.Entry(entity).State = EntityState.Modified;
            }
            await SaveChangesAsync();
        }
        public async Task<OperationResult> UpdateAsync(TEntity entity)
        {
            try
            {
                AttachIfDetached(entity);

                // Mark the entity as modified
                _context.Entry(entity).State = EntityState.Modified;

                // Save changes to the context
                try
                {
                    var result = await SaveChangesAsync();
                    return result;
                }
                catch (DbUpdateConcurrencyException ex)
                {
                    // Handle concurrency exception if the record was modified or deleted by another user
                    return OperationResult.FailureResult("The record was modified or deleted by another user. Please reload and try again.");
                }
            }
            catch (Exception ex)
            {
                return OperationResult.FailureResult($"Error updating entity: {ex.Message}");
            }
        }


        public async Task<OperationResult> SaveChangesAsync(CancellationToken cancellationToken)
        {
            return await SaveChangesInternalAsync(cancellationToken);
        }
        
        internal class BaseEntity
        {
            public int Id { get; set; }
        }
         */

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        // Protected virtual method for disposing resources
        protected virtual void Dispose(bool disposing)
        {
            if (_disposed)
                return;

            if (disposing)
            {
                // Dispose managed resources
                _context?.Dispose();
            }

            // Dispose unmanaged resources (if any)
            _disposed = true;
        }

        // Finalizer for cleaning up if Dispose wasn't called
        ~Repository()
        {
            Dispose(false);
        }

        #region Private Helpers

        private void ValidateEntity(TEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "Entity must not be null");
        }

        private void ValidateEntities(IQueryable<TEntity> entities)
        {
            if (entities == null)
                throw new ArgumentNullException(nameof(entities), "Entities must not be null");
        }

        private void AttachIfDetached(TEntity entity)
        {
            var entry = _context.Entry(entity);
            if (entry.State == EntityState.Detached)
            {
                _dbSet.Attach(entity);
            }
        }

        private async Task<OperationResult> SaveChangesInternalAsync(CancellationToken cancellationToken)
        {
            try
            {
                var success = await _context.SaveChangesAsync(cancellationToken) > 0;
                return success ? OperationResult.SuccessResult("") : OperationResult.FailureResult("Changes saving failure!");
            }
            catch (Exception ex)
            {
                return OperationResult.FailureResult($"Error saving changes: {ex.Message}");
            }
        }

        #endregion
    }

}
