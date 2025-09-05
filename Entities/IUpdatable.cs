
namespace Entities
{
    public interface IUpdatable
    {
      //  void Update(object input);
    }

    public interface IUpdatable<T> : IUpdatable
    {
        void Update(T input);
    }

}
